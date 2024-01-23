const User = require("../models/user");
const BlogPost = require("../models/blogPost");
const Reaction = require('../models/reaction')
const ReactionCounter = require('../models/reactionCounter')
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const fs = require('fs')
const path = require('path')
const query = require('../utils/query')
const createDOMPurify = require('dompurify')
const { JSDOM } = require('jsdom')
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
    
    const data = {
        title,
        user,
        isMainUser,
        inputs: {},
        errors: []
    }

    res.render("pages/userProfile", { data });
});

exports.updateUser = [
    // files processed after body middleware
    body("username")
        .trim()
        .isLength({ min: 6, max: 30 })
        .withMessage("Username must have 6 to 30 characters.")
        .custom((value) => {
            const usernameFormat = /^[-\dA-Za-z]*$/
            return usernameFormat.test(value)
        })
        .withMessage("Username must only contain alphanumeric characters and '-'.")
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

        const window = new JSDOM('').window;
        const DOMPurify = createDOMPurify(window);

        // Cannot repopulate profile-pic input with file, so it is
        // omitted here 
        const inputs = {
            username: DOMPurify.sanitize(req.body.username),
            bio: DOMPurify.sanitize(req.body.bio),
            keywords: DOMPurify.sanitize(req.body.keywords),
        }

        const nonFileErrors = validationResult(req).array()
        errors.push(...nonFileErrors)

        if (errors.length) {
            const data = {
                title: "Your Profile",
                user: req.user,
                isMainUser: true,
                inputs: inputs,
                errors: errors
            }

            // find public blog posts only
            data.user.blog_posts_written = await BlogPost
                .find({
                    author:  data.user._id,
                    public_version: { $exists: false },
                    publish_date: { $exists: true } 
                })
                .lean()
                .exec()
            
            res.render("pages/userProfile", { data });

            return
        }

        const filter = {
            username: req.user.username
        }
        const update = {
            username: inputs.username
        }

        const { bio, keywords } = inputs
        update.bio = bio || undefined
        update.keywords = keywords ? keywords.split(' ') : undefined

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
        await query.completeBlogPost(
            blogPost, req.user, false, false
        )

        if (blogPost.publish_date !== 'N/A') {
            publishedBlogPosts.push(blogPost)
        }
        else {
            unpublishedBlogPosts.push(blogPost)
        }
    }
    
    const data = {
        title: 'Your Blog Posts',
        publishedBlogPosts,
        unpublishedBlogPosts
    }

    res.render("pages/userBlogPosts", { data });
})

// Display blog post create form
exports.getBlogPostCreateForm = [
    function (req, res, next) {

        const data = {
            title: "Create Blog Post",
            inputs: {},
            errors: [],
            blogPost: {}
        }
        
        res.render("pages/blogPostForm",  { data })
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

            const reactionCounter = new ReactionCounter({
                content: {
                    content_type: 'BlogPost',
                    content_id: privateBlogPost._id
                },
                like_count: 0,
                dislike_count: 0
            })
            await reactionCounter.save()
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

        const data = {
            title: 'Update Blog Post',
            inputs: {
                title: blogPost.title,
                keywords: blogPost.keywords.join(' '),
                content: blogPost.content
            },
            errors: [],
            blogPost
        }
    
        res.render("pages/blogPostForm", { data });
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

    const window = new JSDOM('').window;
    const DOMPurify = createDOMPurify(window);

    const inputs = {
        title: DOMPurify.sanitize(req.body.title),
        keywords: DOMPurify.sanitize(req.body.keywords),
        content: DOMPurify.sanitize(req.body.content)
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
            title: (blogPost ? 'Update' : 'Create') + ' Blog Post',
            inputs,
            errors,
            blogPost: blogPost || {}
        }
        
        res.render("pages/blogPostForm", { data });

        return null
    }

    const blogPostData = {
        title: inputs.title,
        author: req.user._id,
        content: inputs.content, 
        last_modified_date: Date.now()
    }

    if (inputs.keywords) {
        blogPostData.keywords = inputs.keywords.split(' ')
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