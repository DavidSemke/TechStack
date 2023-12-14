const User = require("../models/user");
const Blog = require("../models/blog");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const fs = require('fs')
const path = require('path')
const ents = require('../utils/htmlEntities')
const _ = require('lodash')

// Display user profile
// Usernames are unique, and so they are used as ids
exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User
        .findOne({username: req.params.username})
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
    const data = _.cloneDeep(safeData)
    ents.decodeObject(
        data,
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
            const filter = { username: value }
            ents.encodeObject(filter)

            const user = await User
                .findOne(filter)
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
            const rawUser = _.cloneDeep(req.user)
            ents.decodeObject(
                rawUser,
                (key, value) => key !== 'profile_pic'
            )

            const data = {
                title: "Your Profile",
                user: rawUser,
                isMainUser: true,
                inputs: inputs,
                errors: errors
            }

            const safeData = _.cloneDeep(data)
            ents.encodeObject(safeData)
            
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
            update.bio = inputs.bio
        }

        if (inputs.keywords) {
            update.keywords = inputs.keywords.split(' ')
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

        const updatedUser = await User.findOneAndUpdate(
            filter, update, { new: true }
        )

        res.redirect(303, `/users/${updatedUser.username}`)
    })
]


exports.getBlogs = [
    // getAuthorization,


]

// Display blog create form
exports.getBlogCreateForm = [
    function (req, res, next) {

        const safeData = {
            title: "Create Blog",
            inputs: {},
            errors: []
        }
        const data = _.cloneDeep(safeData)
        
        res.render("pages/blogForm",  { data, safeData })
    }
]
    
// On blog create
exports.postBlog = [
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
        .withMessage("Blog must be 500 to 3000 words."),

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
                title: "Create Blog",
                inputs: inputs,
                errors: errors
            }
            const safeData = _.cloneDeep(data)
            ents.encodeObject(safeData)
            
            res.render("pages/blogForm", { data, safeData });

            return
        }

        ents.encodeObject(inputs)

        // const user = req.user
        const blog = new Blog({
            title: inputs.title,
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
            keywords: inputs.keywords.split(' '),
            content: inputs.content,
            likes: 0,
            dislikes: 0
        });

        await blog.save();

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
        
        res.redirect(blog.url)
    }) 
];

// On blog delete
exports.deleteBlog = [

    asyncHandler(async (req, res, next) => {
        await Comment.deleteMany({blog: req.params.blogId}).exec()
        await Blog.findByIdAndRemove(req.params.blogId).exec()
        res.redirect("/");
    })
]

// Display blog update form
exports.getBlogUpdateForm = [

    asyncHandler(async (req, res, next) => {
        const blog = await Blog.findById(req.params.blogId).exec()
    
        if (blog === null) {
            const err = new Error("Blog not found");
            err.status = 404;
            
            return next(err);
        }

        const safeData = {
            title: 'Update Blog',
            inputs: {
                title: blog.title,
                keywords: blog.keywords,
                content: blog.content
            },
            errors: []
        }
        const data = _.cloneDeep(safeData)
        ents.decodeObject(data)
    
        res.render("pages/blogForm", { data, safeData });
    })
]
    
// On blog update
exports.updateBlog = [
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
        .withMessage("Blog must be 500 to 3000 words."),
        
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
                title: "Create Blog",
                inputs: inputs,
                errors: errors
            }
            const safeData = _.cloneDeep(data)
            ents.encodeObject(safeData)
            
            res.render("pages/blogForm", { data, safeData });

            return
        }

        ents.encodeObject(inputs)

        // const user = req.user
        const blog = new Blog({
            title: inputs.title,
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
            keywords: inputs.keywords.split(' '),
            content: inputs.content,
            likes: 0,
            dislikes: 0
        });

        await Blog.findOneAndReplace({_id: req.params.blogId}, blog).exec();

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
        
        res.redirect(blog.url)
    }) 
];