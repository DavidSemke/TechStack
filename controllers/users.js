const User = require("../models/user");
const Blog = require("../models/blog");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

function checkAuthorization(req, res, next) {
    if (
        !req.user
        || req.user.username !== req.params.username
    ) {
        
        const err = new Error("Cannot perform blog CRUD using a nonmatching account.");
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

    const user = {
        'username': 'John Doe',
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

    let title = `${user.username}'s Profile`
    let isMainUser = false

    if (
        req.user 
        && user.username === req.user.username
    ) {
        title = 'Your Profile'
        isMainUser = true
    }

    res.render(
        "pages/userProfile", 
        { 
            title,
            user,
            isMainUser
        }
    );
});

// Display blog create form
exports.getBlogCreateForm = [
    checkAuthorization,
    asyncHandler(async (req, res, next) => {

        if (
            !req.user
            || req.user.username !== req.params.username
        ) {
            
            const err = new Error("Cannot create blog using another account.");
            err.status = 403;
            
            return next(err);
        }

        res.render("pages/blogForm", { title: "Create Blog" });
    })
]
    
// On blog create
exports.postBlog = [
    checkAuthorization,
    function (req, res, next) {
        if (
            !req.user
            || req.user.username !== req.params.username
        ) {
            
            const err = new Error("Cannot create blog using another account.");
            err.status = 403;
            
            return next(err);
        }
    },
    // Validate and sanitize
    body("title")
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage("Blog must have a title.")
        .escape()
        .custom(asyncHandler(async (value) => {
            return !(await Blog.findOne({ title: value }).exec())
        }))
        .withMessage('Blog title already exists.'),
    body("keywords")
        .optional({ values: "falsy" })
        .trim()
        .escape(),
    body("content")
        .trim()
        .escape(),

    // Process request
    asyncHandler(async (req, res, next) => {
        const inputs = {
            title: req.body.title,
            keywords: req.body.keywords,
            content: req.body.content
        }
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
        // Render errors
        res.render("pages/blogForm", {
            ...inputs,
            blogTitle: inputs.title,
            title: "Create Blog",
            errors: errors.array(),
        });

        return;
        }

        const user = req.user
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

        await blog.save();

        // view new blog
        res.redirect(blog.url);
    }),
];

// On blog delete
exports.deleteBlog = [
    checkAuthorization,
    asyncHandler(async (req, res, next) => {

        await Comment.deleteMany({blog: req.params.id}).exec()
        await Blog.findByIdAndRemove(req.params.id).exec()
        res.redirect("/");
    })
]

// Display blog update form
exports.getBlogUpdateForm = [
    checkAuthorization,
    asyncHandler(async (req, res, next) => {
        const blog = await Blog.findById(req.params.id).exec()
    
        if (blog === null) {
            res.redirect('/')
        }
    
        res.render("pages/blogForm", {
            ...blog,
            blogTitle: blog.title,
            title: "Update Blog"
        });
    })
]
    
// On blog update
exports.updateBlog = [
    checkAuthorization,
    // Validate and sanitize
    body("title")
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage("Blog must have a title.")
        .escape()
        .custom(asyncHandler(async (value) => {
            const blog = await Blog.findById(req.params.id).exec()

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

    // Process request
    asyncHandler(async (req, res, next) => {
        const inputs = {
            title: req.body.title,
            keywords: req.body.keywords,
            content: req.body.content
        }
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // Render errors
            res.render("pages/blogForm", {
                ...inputs,
                blogTitle: inputs.title,
                title: "Update Blog",
                errors: errors.array()
            });

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

        await Blog.findOneAndReplace({_id: req.params.id}, blog).exec();

        // view updated blog
        res.redirect(blog.url);
    }),
];