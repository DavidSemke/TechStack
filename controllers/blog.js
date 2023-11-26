const Blog = require("../models/blog");
const Comment = require("../models/comment");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
  
// Display blog
exports.getBlog = asyncHandler(async (req, res, next) => {
  
    // const [blog, comments] = await Promise.all([
    //     Blog.findById(req.params.id).exec(),
    //     Comment.find({ blog: req.params.id }).exec(),
    // ]);

    // if (blog === null) {
    //     const err = new Error("Blog not found");
    //     err.status = 404;
        
    //     return next(err);
    // }

    const blog = {
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
        'publish_date': '2020/12/12'
    }

    const comments = [
        {
            '_id': 0,
            'author': {
                'name': 'JJ Man'
            },
            'publish_date': '2020/12/12',
            'content': 'I like this',
            'likes': 0,
            'dislikes': 0,
            'reply_to': null
        },
        {   
            '_id': 1,
            'author': {
                'name': 'Puny Goon'
            },
            'publish_date': '2020/12/13',
            'content': 'I don\'t like this',
            'likes': 0,
            'dislikes': 0,
            'reply_to': null
        },
        {
            '_id': 2,
            'author': {
                'name': 'Trollmasterxd'
            },
            'publish_date': '2020/12/14',
            'content': 'Captain America: Civil War',
            'likes': 0,
            'dislikes': 0,
            'reply_to': null
        }
    ]

    blog.comments = comments

    res.render(
        "pages/blog", 
        { 
            title: blog.title,
            blog
        }
    );
});
  
// Display blog create form
exports.getBlogCreateForm = asyncHandler(async (req, res, next) => {
  res.render("pages/blogForm", { title: "Create Blog" });
});
  
// On blog create
exports.postBlog = [
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
exports.deleteBlog = asyncHandler(async (req, res, next) => {
    await Comment.deleteMany({blog: req.params.id}).exec()
    await Blog.findByIdAndRemove(req.params.id).exec()
    res.redirect("/");
});

// Display blog update form
exports.getBlogUpdateForm = asyncHandler(async (req, res, next) => {
    const blog = await Blog.findById(req.params.id).exec()

    if (blog === null) {
        res.redirect('/')
    }

    res.render("pages/blogForm", {
        ...blog,
        blogTitle: blog.title,
        title: "Update Blog"
    });
});
    
// On blog update
exports.updateBlog = [
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