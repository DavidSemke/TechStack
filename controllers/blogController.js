const BlogModel = require("../models/Blog");
const CommentModel = require("../models/comment");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");


// Display list of all blogs
exports.getBlogs = asyncHandler(async (req, res, next) => {
    const allBlogs = await BlogModel
        .find()
        .sort({ likes: 'desc' })
        .exec();
    
    res.render("blogList", {
        title: "Blog List",
        blogList: allBlogs
  });
});
  
// Display blog
exports.getBlog = asyncHandler(async (req, res, next) => {
  
    const [blog, comments] = await Promise.all([
        BlogModel.findById(req.params.id).exec(),
        CommentModel.find({ blog: req.params.id }).exec(),
    ]);

    if (blog === null) {
        const err = new Error("Blog not found");
        err.status = 404;
        
        return next(err);
    }

    res.render("blog", { ...blog, comments });
});
  
// Display blog create form
exports.getBlogCreateForm = asyncHandler(async (req, res, next) => {
  res.render("blogForm", { title: "Create Blog" });
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
        return !(await BlogModel.findOne({ title: value }))
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
      res.render("blogForm", {
        ...inputs,
        blogTitle: inputs.title,
        title: "Create Blog",
        errors: errors.array(),
      });

      return;
    } 
    
    const blog = new BlogModel({
        ...inputs,

        // get current user !!!!!!!!!!!!!!!!
        // author: ...,

        publish_date: null,
        likes: 0,
        dislikes: 0
    });

    await blog.save();

    // view new blog
    res.redirect(blog.url);
  }),
];


// Display blog delete form
exports.getBlogDeleteForm = asyncHandler(async (req, res, next) => {
    const blog = await BlogModel.findById(req.params.id).exec()

    if (blog === null) {
        res.redirect('/')
    }

    res.render(
        "blogDeleteForm", 
        { 
            ...blog,
            blogTitle: blog.title,
            title: "Delete Blog"
        }
    )
});


// On blog delete
exports.deleteBlog = asyncHandler(async (req, res, next) => {
    await CommentModel.deleteMany({blog: req.params.id})
    await BlogModel.findByIdAndRemove(req.params.id);
    res.redirect("/");
});

// Display blog update form
exports.getBlogUpdateForm = asyncHandler(async (req, res, next) => {
    const blog = await BlogModel.findById(req.params.id).exec()

    if (blog === null) {
        res.redirect('/')
    }

    res.render("blogForm", {
        ...blog,
        blogTitle: blog.title,
        title: "Update Blog",
        errors: errors.array(),
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
            const blog = await BlogModel.findById(req.params.id).exec()

            return (
                blog.title === value 
                || !(await BlogModel.findOne({ title: value }))
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
            res.render("blogForm", {
                ...inputs,
                blogTitle: inputs.title,
                title: "Update Blog",
                errors: errors.array(),
            });

            return;
        }
        
        const blog = new BlogModel({
            ...inputs,

            // get current user !!!!!!!!!!!!!!!!
            // author: ...,

            publish_date: null,
            likes: 0,
            dislikes: 0
        });

        await BlogModel.findOneAndReplace({_id: req.params.id}, blog);

        // view updated blog
        res.redirect(blog.url);
    }),
];