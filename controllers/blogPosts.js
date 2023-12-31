const BlogPost = require("../models/blogPost");
const Comment = require("../models/comment");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const ents = require('../utils/htmlEntities')

  
// Display blog post
exports.getBlogPost = asyncHandler(async (req, res, next) => {
  
    const [blogPost, comments] = await Promise.all([
        BlogPost.findById(req.params.id)
            .lean()
            .exec(),
        Comment.find({ blogPost: req.params.id })
            .lean()
            .exec(),
    ]);

    if (blogPost === null) {
        const err = new Error("Blog post not found");
        err.status = 404;
        
        return next(err);
    }

    blogPost.comments = comments

    const safeData = {
        title: blogPost.title,
        blogPost
    }
    const data = ents.decodeObject(
        safeData,
        (key, value) => key !== 'thumbnail' && key !== 'profile_pic'
    )

    res.render("pages/blogPost", { data, safeData });
});
    
// On comment create
exports.postComment = [
    
    body("content")
        .trim()
        .isLength({ min: 1, max: 300 })
        .withMessage(
            "Comment must be 1 to 300 characters."
        ),

    asyncHandler(async (req, res, next) => {
        const content = req.body.content
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            const data = {
                content,
                errors: errors.array()
            }
            const safeData = ents.encodeObject(data)
            
            res.render("pages/commentForm ", { data, safeData })
        } 
    
        const comment = new Comment({
            author: req.user._id,
            blogPost: req.params.blogPostId,
            publish_date: Date.now(),
            content: ents.encode(content),
            likes: 0,
            dislikes: 0,
        });

        await comment.save();

        res.end()
    }),
];