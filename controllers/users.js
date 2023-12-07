const User = require("../models/user");
const Blog = require("../models/blog");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const fs = require('fs')
const path = require('path')

const user = {
    'username': 'JohnDoe',
    'password': 'xdxdxd',
    'bio': 'Hello I am John. I like tennis and other white people things. Look out for my next blog on the best pizza places in town!',
    'keywords': ['pizza', 'white', 'tennis'],
    'blogs_recently_read': [
        {
            'title': 'Latest Blog: We Went Fishing And Yes Fishing is a Sport.',
            'author': {
                'name': 'James Games'
            },
            'keywords': [
                'Tech', 
                'BigTech',
                'ShinyTech',
                'CoolTech',
                'NewTech',
                'FreshTech', 
                'SpicyTech', 
                'HeckTech',
                'SteakTech', 
                'BreakTech'
            ],
            'content': "Let me tell you a story about an itty bitty spider that fell down the stairs. It was a Wednesday. I think I had spaghetti on Wednesday, meatballs and everything. I should have spaghetti more often, but then it wouldn't be as special, you know? Also Mom only makes her special sauce once and a while, and the spaghetti simply is not the same without it.",
            'likes': 0,
            'dislikes': 0,
            'publish_date': '2020/12/12',
            'url': '#'
        }
    ],
    'blogs_written': [
        {
            'title': 'Latest Blog: We Went Fishing And Yes Fishing is a Sport.',
            'author': {
                'name': 'James Games'
            },
            'keywords': [
                'Tech', 
                'BigTech',
                'ShinyTech',
                'CoolTech',
                'NewTech',
                'FreshTech', 
                'SpicyTech', 
                'HeckTech',
                'SteakTech', 
                'BreakTech'
            ],
            'content': "Let me tell you a story about an itty bitty spider that fell down the stairs. It was a Wednesday. I think I had spaghetti on Wednesday, meatballs and everything. I should have spaghetti more often, but then it wouldn't be as special, you know? Also Mom only makes her special sauce once and a while, and the spaghetti simply is not the same without it.",
            'likes': 0,
            'dislikes': 0,
            'publish_date': '2020/12/12',
            'url': '#'
        }
    ]
}

// used to protect user-specific paths
function checkAuthorization(req, res, next) {
    if (
        !req.user
        || req.user.username !== req.params.username
    ) {
        
        const err = new Error(
            "Cannot perform blog CRUD using another user's account."
        );
        err.status = 403;
        
        return next(err);
    }
}

// Display user profile
// Usernames are unique, and so are used as ids
exports.getUser = asyncHandler(async (req, res, next) => {
    // const user = await User
    //     .find({username: req.params.username})
    //     .exec()

    // if (user === null) {
    //     const err = new Error("User not found");
    //     err.status = 404;
        
    //     return next(err);
    // }

    let title = `${user.username}'s Profile`
    let isMainUser = false

    if (
        req.user 
        && user.username === req.user.username
    ) {
        title = 'Your Profile'
        isMainUser = true
    }

    const data = {
        title,
        user,
        isMainUser
    }

    res.render("pages/userProfile", { data });
});

exports.getBlogs = [
    // getAuthorization,


]

// Display blog create form
exports.getBlogCreateForm = [
    // checkAuthorization,

    function (req, res, next) {
        res.locals.mainUser = user

        const data = {
            title: "Create Blog",
            inputs: {},
            errors: []
        }
        
        res.render("pages/blogForm",  { data })
    }
]
    
// On blog create
exports.postBlog = [
    // checkAuthorization,

    
    // Thumbnail image processed after body middleware
    body("title")
        .trim()
        .isLength({ min: 60, max: 100 })
        .withMessage("Title must have 60 to 100 characters.")
        .escape(),
    body("keywords")
        .trim()
        .custom((value) => {
            const wordCount = value
                .split(' ')
                .filter(x => x)
                .length
            
            return !(wordCount < 1 || wordCount > 10)
        })
        .withMessage('Must have 1 to 10 keywords.')
        .escape(),
    body('content')
        .escape(),
    body("word-count")
        .custom((value) => {
            let wordCount = parseInt(value)
            
            return !(wordCount < 500 || wordCount > 3000)
        })
        .withMessage("Blog must be 500 to 3000 words."),

    
    asyncHandler(async (req, res, next) => {
        res.locals.mainUser = user

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
        else if (!req.file) {
            errors.push(
                {
                    'path': 'thumbnail',
                    'msg': 'File is invalid. Choose another.'
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
            
            res.render("pages/blogForm", { data });

            return
        }

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
                name: user.username,
                profile_pic: user.profile_pic ?? null
            },
            publish_date: Date.now(),
            keywords: inputs.keywords.split(' '),
            content: inputs.content,
            likes: 0,
            dislikes: 0
        });

        await blog.save();

        // view new blog
        // res.redirect(blog.url);
        res.redirect('/')
    }) 
];

// On blog delete
exports.deleteBlog = [
    checkAuthorization,

    asyncHandler(async (req, res, next) => {
        await Comment.deleteMany({blog: req.params.blogId}).exec()
        await Blog.findByIdAndRemove(req.params.blogId).exec()
        res.redirect("/");
    })
]

// Display blog update form
exports.getBlogUpdateForm = [
    checkAuthorization,

    asyncHandler(async (req, res, next) => {
        const blog = await Blog.findById(req.params.blogId).exec()
    
        if (blog === null) {
            res.redirect('/')
        }

        // need to decode content, since it will be escaped!!!!!!!!!!!!!!!!!!

        const data = {
            title: 'Update Blog',
            inputs: {
                title: blog.title,
                keywords: blog.keywords,
                content: blog.content
            },
            errors: []
        }
    
        res.render("pages/blogForm", { data });
    })
]
    
// On blog update
exports.updateBlog = [
    checkAuthorization,

    body("title")
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage("Blog must have a title.")
        .escape()
        .custom(asyncHandler(async (value) => {
            const blog = await Blog.findById(req.params.blogId).exec()

            return (
                blog.title === value 
                || !(await Blog.findOne({ title: value }).exec())
            )
        }))
        .withMessage('Blog title already exists.'),
    body("keywords")
        .optional({ values: "falsy" })
        .trim()
        .escape(),
    body("content")
        .trim()
        .escape(),

    asyncHandler(async (req, res, next) => {
        const inputs = {
            title: req.body.title,
            keywords: req.body.keywords,
            content: req.body.content
        }
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            const data = {
                title: 'Update Blog',
                inputs,
                errors: errors.array()
            }
            
            res.render("pages/blogForm", { data });

            return;
        }
        
        const blog = new Blog({
            ...inputs,
            author: {
                name: user.username,
                profile_pic: user.profile_pic
            },
            publish_date: null,
            likes: 0,
            dislikes: 0
        });

        await Blog.findOneAndReplace({_id: req.params.blogId}, blog).exec();

        // view updated blog
        res.redirect(blog.url);
    }),
];