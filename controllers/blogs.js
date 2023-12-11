const Blog = require("../models/blog");
const Comment = require("../models/comment");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

  
// Display blog
exports.getBlog = asyncHandler(async (req, res, next) => {
  
    const [blog, comments] = await Promise.all([
        Blog.findById(req.params.id).exec(),
        Comment.find({ blog: req.params.id }).exec(),
    ]);

    if (blog === null) {
        const err = new Error("Blog not found");
        err.status = 404;
        
        return next(err);
    }

    blog.comments = comments

    const data = {
        title: blog.title,
        blog
    }

    res.render("pages/blog", { data });
});
    
// On comment create
exports.postComment = [
    
    body("content")
        .trim()
        .isLength({ min: 1, max: 300 })
        .withMessage(
            "Comment must be 1 to 300 characters."
        )
        .escape(),

    asyncHandler(async (req, res, next) => {
        const content = req.body.content
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            const data = {
                content,
                errors: errors.array()
            }

            
            res.render("pages/commentForm ", { data })
        } 
    
        const comment = new Comment({
            
            // get current user !!!!!!!!!!!!!!!!
            // author: ...,

            publish_date: Date.now(),
            content,
            likes: 0,
            dislikes: 0,
            replies: []
        });

        await comment.save();
    }),
];