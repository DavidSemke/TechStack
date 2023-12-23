const User = require("../models/user");
const BlogPost = require("../models/blogPost");
const Comment = require('../models/comment')
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const fs = require('fs')
const path = require('path')
const ents = require('../utils/htmlEntities')
const dateFormat = require('../utils/dateFormat')

// Display user profile
// Usernames are unique, and so they are used as ids
exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User
        .findOne({ username: req.params.username })
        .lean()
        .exec()

    if (user === null) {
        const err = new Error("User not found");
        err.status = 404;
        
        return next(err);
    }

    let title = `${user.username}'s Profile`
    let isMainUser = false

    if (
        req.user 
        && user.username === req.user.username
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
        (key, value) => key !== 'profile_pic'
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
                        'upload',
                        'files',
                        req.file.filename
                    )
                ),
                contentType: req.file.mimetype
            }

            // delete uploaded profile pic
            fs.unlink(
                path.join(
                    process.cwd(),
                    'upload',
                    'files',
                    req.file.filename
                ),
                (err) => {
                    if (err) {
                        return next(err)
                    }
                }
            )
        }

        await User.findOneAndUpdate(filter, update).lean().exec()

        res.redirect(303, `/users/${updatedUser.username}`)
    })
]


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

    const blogPosts = await BlogPost
        .find({ author: user._id })
        .lean()
        .exec()

    const publishedBlogPosts = []
    const unpublishedBlogPosts = []

    for (const blogPost of blogPosts) {
        const comments = await Comment
            .find({ blogPost: blogPost._id })
            .lean()
            .exec()
        blogPost.comments = comments

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
            errors: []
        }
        const data = _.cloneDeep(safeData)
        
        res.render("pages/blogPostForm",  { data, safeData })
    }
]
    
// On blog post create
exports.postBlogPost = [
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
    body("word-count")
        .custom((value) => {
            let wordCount = parseInt(value)
            
            return !(wordCount < 500 || wordCount > 3000)
        })
        .withMessage("Blog post must be 500 to 3000 words."),

    asyncHandler(async (req, res, next) => {
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

        const nonFileErrors = validationResult(req).array()
        errors.push(...nonFileErrors)

        if (errors.length) {
            const data = {
                title: "Create Blog Post",
                inputs: inputs,
                errors: errors
            }
            const safeData = ents.encodeObject(data)
            
            res.render("pages/blogPostForm", { data, safeData });

            return
        }

        const encodedInputs = ents.encodeObject(inputs)

        const blogPost = new BlogPost({
            title: encodedInputs.title,
            thumbnail: {
                data: fs.readFileSync(
                    path.join(
                        process.cwd(),
                        'upload',
                        'files',
                        req.file.filename
                    )
                ),
                contentType: req.file.mimetype
            },
            author: {
                name: req.user.username,
                profile_pic: req.user.profile_pic ?? null
            },
            publish_date: Date.now(),
            keywords: encodedInputs.keywords.split(' '),
            content: encodedInputs.content,
            likes: 0,
            dislikes: 0
        });

        await blogPost.save();

        fs.unlink(
            path.join(
                process.cwd(),
                'upload',
                'files',
                req.file.filename
            ),
            (err) => {
                if (err) {
                    throw err
                }
            }
        )
        
        res.redirect(blogPost.url)
    }) 
];

// On blog post delete
exports.deleteBlogPost = [
    asyncHandler(async (req, res, next) => {
        await Comment.deleteMany({blogPost: req.params.blogPostId}).exec()
        await BlogPost.findByIdAndRemove(req.params.blogPostId).exec()
        res.redirect("/");
    })
]

// Display blog post update form
exports.getBlogPostUpdateForm = [

    asyncHandler(async (req, res, next) => {
        const blogPost = await BlogPost
            .findById(req.params.blogPostId)
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
                keywords: blogPost.keywords,
                content: blogPost.content
            },
            errors: []
        }
        const data = ents.decodeObject(safeData)
    
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
    body("word-count")
        .custom((value) => {
            let wordCount = parseInt(value)
            
            return !(wordCount < 500 || wordCount > 3000)
        })
        .withMessage("Blog post must be 500 to 3000 words."),
        
    asyncHandler(async (req, res, next) => {
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

        const nonFileErrors = validationResult(req).array()
        errors.push(...nonFileErrors)

        if (errors.length) {
            const data = {
                title: "Create Blog Post",
                inputs: inputs,
                errors: errors
            }
            const safeData = ents.encodeObject(data)
            
            res.render("pages/blogPostForm", { data, safeData });

            return
        }

        const encodedInputs =ents.encodeObject(inputs)

        const blogPost = new BlogPost({
            title: encodedInputs.title,
            thumbnail: {
                data: fs.readFileSync(
                    path.join(
                        process.cwd(),
                        'upload',
                        'files',
                        req.file.filename
                    )
                ),
                contentType: req.file.mimetype
            },
            author: {
                name: req.user.username,
                profile_pic: req.user.profile_pic ?? null
            },
            publish_date: Date.now(),
            keywords: encodedInputs.keywords.split(' '),
            content: encodedInputs.content,
            likes: 0,
            dislikes: 0
        });

        await BlogPost
            .findOneAndReplace({_id: req.params.blogPostId}, blogPost)
            .exec();

        fs.unlink(
            path.join(
                process.cwd(),
                'upload',
                'files',
                req.file.filename
            ),
            (err) => {
                if (err) {
                    throw err
                }
            }
        )
        
        res.redirect(blogPost.url)
    }) 
];