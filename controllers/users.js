const User = require("../models/user");
const BlogPost = require("../models/blogPost");
const Comment = require('../models/comment')
const Reaction = require('../models/reaction')
const ReactionCounter = require('../models/reactionCounter')
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const fs = require('fs')
const path = require('path')
const ents = require('../utils/htmlEntities')
const dateFormat = require('../utils/dateFormat')
const { Types } = require('mongoose')

// Display user profile
// Usernames are unique, and so they are used as ids
exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User
        .findOne({ username: req.params.username })
        .populate('blog_posts_recently_read')
        .populate({
            path: 'blog_posts_recently_read',
            populate: {
                path: 'author'
            }
        })
        .lean()
        .exec()

    if (user === null) {
        const err = new Error("User not found");
        err.status = 404;
        
        return next(err);
    }

    // find public blog posts only
    user.blog_posts_written = await BlogPost
        .find({
            author:  user._id,
            public_version: { $exists: false },
            publish_date: { $exists: true } 
        })
        .lean()
        .exec()

    let title = `${user.username}'s Profile`
    let isMainUser = false

    if (
        req.user 
        && user._id.toString() === req.user._id.toString()
    ) {
        title = 'Your Profile'
        isMainUser = true
    }
    
    const safeData = {
        title,
        user,
        isMainUser,
        inputs: {},
        errors: []
    }
    const data = ents.decodeObject(
        safeData,
        (key, value) => key !== 'profile_pic' && key !== 'thumbnail'
    )

    res.render("pages/userProfile", { data, safeData });
});

exports.updateUser = [
    // files processed after body middleware
    body("username")
        .trim()
        .isLength({ min: 6, max: 30 })
        .withMessage("Username must have 6 to 30 characters.")
        .custom(asyncHandler(async (value, { req }) => {
            const user = await User
                .findOne({ username: value })
                .lean()
                .exec()

            if (user && req.user.username !== value) {
                return Promise.reject()
            }
        }))
        .withMessage('Username already exists.'),
    body("bio")
        .trim()
        .isLength({ min: 0, max: 300 })
        .withMessage("Bio cannot have more than 300 characters."),
    body("keywords")
        .trim()
        .custom((value) => {
            const wordCount = value
                .split(' ')
                .filter(x => x)
                .length
            
            return wordCount <= 10
        })
        .withMessage('Cannot have more than 10 keywords.'),
    
    asyncHandler(async (req, res, next) => {
        const errors = []

        if (req.fileTypeError) {
            errors.push( 
                {
                    'path': 'profile-pic',
                    'msg': 'File must be jpeg, jpg, png, webp, or gif.'
                }
            )
        }
        else if (req.fileLimitError) {
            errors.push(
                {
                    'path': 'profile-pic',
                    'msg': req.fileLimitError.message + '.'
                }
            )
        }

        // Cannot repopulate profile-pic input with file, so it is
        // omitted here 
        const inputs = {
            username: req.body.username,
            bio: req.body.bio,
            keywords: req.body.keywords,
        }

        const nonFileErrors = validationResult(req).array()
        errors.push(...nonFileErrors)

        if (errors.length) {
            const rawUser = ents.decodeObject(
                req.user,
                (key, value) => key !== 'profile_pic'
            )
            const data = {
                title: "Your Profile",
                user: rawUser,
                isMainUser: true,
                inputs: inputs,
                errors: errors
            }
            const safeData = ents.encodeObject(
                data,
                (key, value) => key !== 'profile_pic'
            )
            
            res.render("pages/userProfile", { data, safeData });

            return
        }

        const filter = {
            username: req.user.username
        }
        const update = {
            username: inputs.username
        }

        if (inputs.bio) {
            update.bio = ents.encode(inputs.bio)
        }

        if (inputs.keywords) {
            update.keywords = ents.encode(inputs.keywords).split(' ')
        }
        
        // add new profile pic to update if uploaded
        if (req.file) {
            update.profile_pic = {
                data: fs.readFileSync(
                    path.join(
                        process.cwd(),
                        'uploads',
                        req.file.filename
                    )
                ),
                contentType: req.file.mimetype
            }

            // delete uploaded profile pic
            fs.unlink(
                path.join(
                    process.cwd(),
                    'uploads',
                    req.file.filename
                ),
                (err) => {
                    if (err) {
                        return next(err)
                    }
                }
            )
        }

        const updatedUser = await User
            .findOneAndUpdate(
                filter, update, { new: true }
            )
            .lean()
            .exec()

        res.redirect(303, `/users/${updatedUser.username}`)
    })
]

exports.postReaction = asyncHandler(async (req, res, next) => {
    const contentType = req.body['content-type']
    const contentId = new Types.ObjectId(req.body['content-id'])
    const reactionType = req.body['reaction-type']

    const promises = []

    const reaction = new Reaction({
        user: req.user._id,
        content: {
            content_type: contentType,
            content_id: contentId
        },
        reaction_type: reactionType
    })
    promises.push(reaction.save())

    const countAttribute = `${reactionType.toLowerCase()}_count`
    promises.push(
        ReactionCounter.findOneAndUpdate(
            { 
                content: {
                    content_type: contentType,
                    content_id: contentId
                }
            },
            { $inc: { [countAttribute]: 1 } }
        )
    )

    await Promise.all(promises)

    res.json({ reactionId: reaction._id })
})

exports.updateReaction = asyncHandler(async (req, res, next) => {
    const contentType = req.body['content-type']
    const contentId = new Types.ObjectId(req.body['content-id'])
    const reactionType = req.body['reaction-type']
    const reactionId = new Types.ObjectId(req.params.reactionId)

    const promises = [
        Reaction
            .findOneAndUpdate(
                { 
                    _id: reactionId
                },
                {
                    reaction_type: reactionType
                }
            )
            .exec()
    ]

    let primaryCountAttribute = null
    let secondaryCountAttribute = null

    if (reactionType === 'Like') {
        primaryCountAttribute = 'like_count'
        secondaryCountAttribute = 'dislike_count'
    }
    else if (reactionType === 'Dislike') {
        primaryCountAttribute = 'dislike_count'
        secondaryCountAttribute = 'like_count'
    }

    promises.push(
        ReactionCounter.findOneAndUpdate(
            { 
                content: {
                    content_type: contentType,
                    content_id: contentId
                }
            },
            { 
                $inc: { 
                    [primaryCountAttribute]: 1,
                    [secondaryCountAttribute]: -1
                },
            }
        )
            .exec()
    )

    await Promise.all(promises)

    res.json({ reactionId })
})

exports.deleteReaction = asyncHandler(async (req, res, next) => {
    const contentType = req.body['content-type']
    const contentId = new Types.ObjectId(req.body['content-id'])
    const reactionType = req.body['reaction-type']
    const reactionId = new Types.ObjectId(req.params.reactionId)

    const promises = [
        Reaction
            .findOneAndDelete(
                { 
                    _id: reactionId
                }
            )
            .exec()
    ]

    const countAttribute = `${reactionType.toLowerCase()}_count`
    promises.push(
        ReactionCounter.findOneAndUpdate(
            { 
                content: {
                    content_type: contentType,
                    content_id: contentId
                }
            },
            { $inc: { [countAttribute]: -1 } }
        )
    )

    await Promise.all(promises)

    res.json({ reactionId: null })
})

exports.getBlogPosts = asyncHandler(async (req, res, next) => {
    const user = await User
        .findOne({ username: req.params.username })
        .lean()
        .exec()

    if (user === null) {
        const err = new Error("User not found");
        err.status = 404;
        
        return next(err);
    }

    // get all private blog posts 
    // (private blog post can be unpublished or edit of published)
    const privateBlogPosts = await BlogPost
        .find({ 
            author: user._id,
            $or: [
                { public_version: { $exists: true } },
                { publish_date: { $exists: false} }
            ]
        })
        .lean()
        .exec()

    const publishedBlogPosts = []
    const unpublishedBlogPosts = []

    for (const blogPost of privateBlogPosts) {
        const [comments, reactionCounter] = await Promise.all(
            [
                Comment
                    .find({ blogPost: blogPost._id })
                    .lean()
                    .exec(),
                ReactionCounter
                    .find({
                        content: {
                            content_type: 'BlogPost',
                            content_id: blogPost._id
                        }
                    })
                    .lean()
                    .exec()
            ]
        )

        blogPost.comments = comments
        blogPost.likes = reactionCounter.like_count
        blogPost.dislikes = reactionCounter.dislike_count

        if (blogPost.publish_date) {
            blogPost.publish_date = dateFormat.formatDate(
                blogPost.publish_date
            )

            publishedBlogPosts.push(blogPost)
        }
        else {
            unpublishedBlogPosts.push(blogPost)
        }
        
        blogPost.last_modified_date = dateFormat.formatDate(
            blogPost.last_modified_date
        )
    }
    
    const safeData = {
        title: 'Your Blog Posts',
        publishedBlogPosts,
        unpublishedBlogPosts
    }
    const data = ents.decodeObject(
        safeData,
        (key, value) => key !== 'thumbnail'
    )

    res.render("pages/userBlogPosts", { data, safeData });
})

// Display blog post create form
exports.getBlogPostCreateForm = [
    function (req, res, next) {

        const safeData = {
            title: "Create Blog Post",
            inputs: {},
            errors: [],
            blogPost: {}
        }
        const data = safeData
        
        res.render("pages/blogPostForm",  { data, safeData })
    }
]
    
// On blog post create
exports.postBlogPost = [
    // Files validated after body middleware
    body("title")
        .trim()
        .isLength({ min: 60, max: 100 })
        .withMessage("Title must have 60 to 100 characters."),
    body("keywords")
        .trim()
        .custom((value) => {
            const wordCount = value
                .split(' ')
                .filter(x => x)
                .length
            
            return !(wordCount < 1 || wordCount > 10)
        })
        .withMessage('Must have 1 to 10 keywords.'),
    body("content")
        .trim(),
    body("word-count")
        .custom((value) => {
            let wordCount = parseInt(value)
            
            return !(wordCount < 500 || wordCount > 3000)
        })
        .withMessage("Blog post must be 500 to 3000 words."),

    asyncHandler(async (req, res, next) => {
        switch (req.body['pre-method']) {
            case 'discard':
                res.redirect(303, `/users/${req.user.username}/blog-posts`)
                break
            case 'save':
                await post(req, res, ['title'])
                break
            case 'publish':
                await post(req, res, null, true)
                break
            default:
                const err = new Error(
                    'Request body key "pre-method" must have value '
                        + '"discard", "save", or "publish".'
                );
                err.status = 400
                
                return next(err);
        }

        // if validationPaths = null, all paths are considered
        async function post(req, res, validationPaths=null, publishing=false) {
            const data = await processBlogPostData(
                req, res, null, validationPaths
            )

            // data is null or an object
            if (!data) {
                return
            }

            // if pre-method = publish
            if (publishing) {
                data.publish_date = Date.now()

                const publicBlogPost = new BlogPost(data);
                await publicBlogPost.save();
        
                data.public_version = publicBlogPost._id

                res.redirect(303, `/blog-posts/${publicBlogPost._id}`)
            }
            else {
                res.end()
            }

            const privateBlogPost = new BlogPost(data)
            await privateBlogPost.save();
        }
    }) 
];

// On blog post delete
// Public blog posts do not depend on private counterparts existing
// Comments should not be deleted - shared by public and private versions
exports.deletePrivateBlogPost = [
    asyncHandler(async (req, res, next) => {
        await BlogPost.findOneAndDelete({ _id: req.params.blogPostId }).exec()
        res.end();
    })
]

// Display blog post update form
exports.getBlogPostUpdateForm = [

    asyncHandler(async (req, res, next) => {
        const blogPost = await BlogPost
            .findById(req.params.blogPostId)
            .populate('public_version')
            .lean()
            .exec()
    
        if (blogPost === null) {
            const err = new Error("Blog post not found");
            err.status = 404;
            
            return next(err);
        }

        const safeData = {
            title: 'Update Blog Post',
            inputs: {
                title: blogPost.title,
                keywords: blogPost.keywords.join(' '),
                content: blogPost.content
            },
            errors: [],
            blogPost
        }
        const data = ents.decodeObject(
            safeData,
            (key, value) => key !== 'thumbnail'
        )
    
        res.render("pages/blogPostForm", { data, safeData });
    })
]
    
// On blog post update
exports.updateBlogPost = [
    // files processed after body middleware
    body("title")
        .trim()
        .isLength({ min: 60, max: 100 })
        .withMessage("Title must have 60 to 100 characters."),
    body("keywords")
        .trim()
        .custom((value) => {
            const wordCount = value
                .split(' ')
                .filter(x => x)
                .length
            
            return !(wordCount < 1 || wordCount > 10)
        })
        .withMessage('Must have 1 to 10 keywords.'),
    body("content")
        .trim(),
    body("word-count")
        .custom((value) => {
            let wordCount = parseInt(value)
            
            return !(wordCount < 500 || wordCount > 3000)
        })
        .withMessage("Blog post must be 500 to 3000 words."),
        
    asyncHandler(async (req, res, next) => {
        const blogPost = await BlogPost
            .findById(req.params.blogPostId)
            .populate('public_version')
            .lean()
            .exec()

        switch (req.body['pre-method']) {
            case 'discard':
                await backwardUpdate(req, res, blogPost)
                break
            case 'save':
                await forwardUpdate(req, res, blogPost, ['title'])
                break
            case 'publish':
                await forwardUpdate(req, res, blogPost, null, true)
                break
            default:
                const err = new Error(
                    'Request body key "pre-method" must have value '
                        + '"discard", "save", or "publish".'
                );
                err.status = 400
                
                return next(err);
        }

        async function backwardUpdate(req, res, blogPost) {
            const privateFilter = {
                _id: req.params.blogPostId
            }

            if (blogPost.public_version) {
                const publicBlogPost = {...blogPost.public_version}
                delete publicBlogPost._id

                await BlogPost.findOneAndUpdate(
                    privateFilter, 
                    publicBlogPost
                )
            }
            else {
                await BlogPost.findOneAndDelete(
                    privateFilter
                )
            }

            res.redirect(303, `/users/${req.user.username}/blog-posts`)
        }

        async function forwardUpdate(
            req, res, blogPost, validationPaths=null, publishing=false
        ) {
            const data = await processBlogPostData(
                req, res, blogPost, validationPaths
            )

            // data is null or an object
            if (!data) {
                return
            }

            const privateFilter = {
                _id: req.params.blogPostId
            }
            const privateUpdate = {
                title: data.title,
                thumbnail: data.thumbnail,
                keywords: data.keywords,
                content: data.content,
            }

            if (publishing) {
                privateUpdate.publish_date = Date.now()
                privateUpdate.last_modified_date = Date.now()
                let publicBlogPost = null

                if (blogPost.public_version) {
                    publicBlogPost = blogPost.public_version

                    const publicFilter = {
                        _id: blogPost.public_version._id
                    }
                    const publicUpdate = privateUpdate
    
                    // update public version
                    await BlogPost.findOneAndUpdate(
                        publicFilter, 
                        publicUpdate
                    )
                }
                else {
                    // create a public version
                    const publicBlogPostData = {...blogPost, ...privateUpdate}
                    delete publicBlogPostData._id

                    publicBlogPost = new BlogPost(publicBlogPostData)
                    await publicBlogPost.save();

                    privateUpdate.public_version = publicBlogPost._id
                }

                res.redirect(303, `/blog-posts/${publicBlogPost._id}`)
            }
            else {
                res.end()
            }
    
            // update private version
            await BlogPost.findOneAndUpdate(
                privateFilter, 
                privateUpdate
            )
        }
    }) 
];


async function processBlogPostData(
    req, res, blogPost, validationPaths
) {
    const errors = []

    if (req.fileTypeError) {
        errors.push( 
            {
                'path': 'thumbnail',
                'msg': 'File must be jpeg, jpg, png, webp, or gif.'
            }
        )
    }
    else if (req.fileLimitError) {
        errors.push(
            {
                'path': 'thumbnail',
                'msg': req.fileLimitError.message + '.'
            }
        )
    }

    // Cannot repopulate thumbnail input with file, so it is
    // omitted here 
    const inputs = {
        title: req.body.title,
        keywords: req.body.keywords,
        content: req.body.content
    }

    // remove weird tinymce phenomenon
    if (inputs.content === '<p><br data-mce-bogus="1"></p>') {
        inputs.content = ''
    }

    let nonFileErrors = validationResult(req).array()

    if (validationPaths) {
        nonFileErrors = nonFileErrors.filter(
            error => validationPaths.includes(error.path)
        )
    }

    errors.push(...nonFileErrors)

    if (errors.length) {
        const data = {
            title: (blogPost ? 'Update' : 'Create') + ' Blog Post' ,
            inputs: inputs,
            errors: errors,
            blogPost: blogPost || {}
        }
        const safeData = ents.encodeObject(data)
        
        res.render("pages/blogPostForm", { data, safeData });

        return null
    }

    const encodedInputs = ents.encodeObject(inputs)

    const blogPostData = {
        title: encodedInputs.title,
        author: req.user._id,
        content: encodedInputs.content,
        last_modified_date: Date.now()
    }

    if (encodedInputs.keywords !== '') {
        blogPostData.keywords = encodedInputs.keywords.split(' ')
    }

    if (req.file) {
        blogPostData.thumbnail = {
            data: fs.readFileSync(
                path.join(
                    process.cwd(),
                    'uploads',
                    req.file.filename
                )
            ),
            contentType: req.file.mimetype
        }

        // delete uploaded thumbnail
        fs.unlink(
            path.join(
                process.cwd(),
                'uploads',
                req.file.filename
            ),
            (err) => {
                if (err) {
                    throw err
                }
            }
        )
    }

    return blogPostData
}