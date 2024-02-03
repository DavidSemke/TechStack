const User = require("../models/user");
const BlogPost = require("../models/blogPost");
const Reaction = require('../models/reaction')
const ReactionCounter = require('../models/reactionCounter')
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
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
    let isLoginUserProfile = false

    if (
        req.user 
        && user._id.toString() === req.user._id.toString()
    ) {
        title = 'Your Profile'
        isLoginUserProfile = true
    }
    
    const data = {
        title,
        user,
        isLoginUserProfile
    }

    res.render("pages/userProfile", { data });
});

exports.updateUser = [
    // files processed after body middleware
    body("username")
        .isString()
        .withMessage(
            'Username must be a string.'
        )
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
        .isString()
        .withMessage(
            'Bio must be a string.'
        )
        .trim()
        .isLength({ min: 0, max: 300 })
        .withMessage("Bio cannot have more than 300 characters."),
    body("keywords")
        .isString()
        .withMessage(
            'Keywords must be a string.'
        )
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
            res.status(400).json({ errors })
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
                data: req.file.buffer,
                contentType: req.file.mimetype
            }
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
    const reactionType = req.body['reaction-type']
    let contentId

    try {
        contentId = new Types.ObjectId(req.body['content-id'])
    }
    catch (error) {
        const err = new Error("Invalid ObjectId format");
        err.status = 400;

        return next(err)
    }

    if (contentType !== 'BlogPost' && contentType !== 'Comment') {
        const err = new Error(
            "Content type must be in ['BlogPost', 'Comment']"
        );
        err.status = 400;

        return next(err)
    }

    if (reactionType !== 'Like' && reactionType !== 'Dislike') {
        const err = new Error(
            "Reaction type must be in ['Like', 'Dislike']"
        );
        err.status = 400;

        return next(err)
    }

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
    const reactionType = req.body['reaction-type']
    let contentId, reactionId

    try {
        contentId = new Types.ObjectId(req.body['content-id'])
        reactionId = new Types.ObjectId(req.params.reactionId)
    }
    catch (error) {
        const err = new Error("Invalid ObjectId format");
        err.status = 400;

        return next(err)
    }

    if (contentType !== 'BlogPost' && contentType !== 'Comment') {
        const err = new Error(
            "Content type must be in ['BlogPost', 'Comment']"
        );
        err.status = 400;

        return next(err)
    }

    if (reactionType !== 'Like' && reactionType !== 'Dislike') {
        const err = new Error(
            "Reaction type must be in ['Like', 'Dislike']"
        );
        err.status = 400;

        return next(err)
    }

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
    const reactionType = req.body['reaction-type']
    let contentId, reactionId

    try {
        contentId = new Types.ObjectId(req.body['content-id'])
        reactionId = new Types.ObjectId(req.params.reactionId)
    }
    catch (error) {
        const err = new Error("Invalid ObjectId format");
        err.status = 400;

        return next(err)
    }

    if (contentType !== 'BlogPost' && contentType !== 'Comment') {
        const err = new Error(
            "Content type must be in ['BlogPost', 'Comment']"
        );
        err.status = 400;

        return next(err)
    }

    if (reactionType !== 'Like' && reactionType !== 'Dislike') {
        const err = new Error(
            "Reaction type must be in ['Like', 'Dislike']"
        );
        err.status = 400;

        return next(err)
    }
    
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
    let privateBlogPosts = await BlogPost
        .find({ 
            author: user._id,
            $or: [
                { public_version: { $exists: true } },
                { publish_date: { $exists: false} }
            ]
        })
        .populate('public_version')
        .lean()
        .exec()

    const publishedBlogPosts = []
    const unpublishedBlogPosts = []

    privateBlogPosts = await Promise.all(
        privateBlogPosts.map(async (blogPost) => {
            blogPost = await query.completeBlogPost(
                blogPost, req.user, false, false
            )

            if (blogPost.publish_date !== 'N/A') {
                publishedBlogPosts.push(blogPost)
            }
            else {
                unpublishedBlogPosts.push(blogPost)
            }

            return blogPost
        })
    )
    
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
            blogPost: {}
        }
        
        res.render("pages/blogPostForm",  { data })
    }
]
    
// On blog post create
exports.postBlogPost = [
    // Files validated after body middleware
    body("title")
        .isString()
        .withMessage(
            'Title must be a string.'
        )
        .trim()
        .isLength({ min: 60, max: 100 })
        .withMessage("Title must have 60 to 100 characters."),
    body("keywords")
        .isString()
        .withMessage(
            'Keywords must be a string.'
        )
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
        .isString()
        .withMessage(
            'Content must be a string.'
        )
        .trim(),
    body("word-count")
        .isString()
        .withMessage(
            'Word count must be a string.'
        )
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
                req, res, validationPaths
            )

            // data is undefined or an object
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
        let blogPostId

        try {
            blogPostId = new Types.ObjectId(req.params.blogPostId)
        }
        catch (error) {
            const err = new Error("Invalid ObjectId format");
            err.status = 400;

            return next(err)
        }

        await BlogPost.findOneAndDelete({ _id: blogPostId }).exec()
        res.end();
    })
]

// Display blog post update form
exports.getBlogPostUpdateForm = [
    asyncHandler(async (req, res, next) => {
        let blogPostId

        try {
            blogPostId = new Types.ObjectId(req.params.blogPostId)
        }
        catch (error) {
            const err = new Error("Invalid ObjectId format");
            err.status = 400;

            return next(err)
        }

        const blogPost = await BlogPost
            .findById(blogPostId)
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
            blogPost
        }
    
        res.render("pages/blogPostForm", { data });
    })
]
    
// On blog post update
exports.updateBlogPost = [
    // files processed after body middleware
    body("title")
        .isString()
        .withMessage(
            'Title must be a string.'
        )
        .trim()
        .isLength({ min: 60, max: 100 })
        .withMessage("Title must have 60 to 100 characters."),
    body("keywords")
        .isString()
        .withMessage(
            'Keywords must be a string.'
        )
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
        .isString()
        .withMessage(
            'Content must be a string.'
        )
        .trim(),
    body("word-count")
        .isString()
        .withMessage(
            'Word count must be a string.'
        )
        .custom((value) => {
            let wordCount = parseInt(value)
            
            return !(wordCount < 500 || wordCount > 3000)
        })
        .withMessage("Blog post must be 500 to 3000 words."),
        
    asyncHandler(async (req, res, next) => {
        let blogPostId

        try {
            blogPostId = new Types.ObjectId(req.params.blogPostId)
        }
        catch (error) {
            const err = new Error("Invalid ObjectId format");
            err.status = 400;

            return next(err)
        }

        const blogPost = await BlogPost
            .findById(blogPostId)
            .populate('public_version')
            .lean()
            .exec()

        if (blogPost === null) {
            const err = new Error("Blog post not found");
            err.status = 404;
            
            return next(err);
        }

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
                _id: blogPost._id
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
                req, res, validationPaths
            )

            // data is undefined or an object
            if (!data) {
                return
            }

            const privateFilter = {
                _id: blogPostId._id
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
    req, res, validationPaths
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
                'msg': req.fileLimitError.message
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
        res.status(400).json({ errors })
        return
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
            data: req.file.buffer,
            contentType: req.file.mimetype
        }
    }

    return blogPostData
}