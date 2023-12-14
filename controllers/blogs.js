const Blog = require("../models/blog");
const Comment = require("../models/comment");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const ents = require('../utils/htmlEntities')
const entities = require('entities')
const _ = require('lodash')
  
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

    const safeData = {
        title: blog.title,
        blog
    }
    const data = _.cloneDeep(safeData)
    ents.decodeObject(
        data,
        (key, value) => key !== 'thumbnail' && key !== 'profile_pic'
    )

    res.render("pages/blog", { data, safeData });
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
            const safeData = _.cloneDeep(data)
            ents.encodeObject(safeData)
            
            res.render("pages/commentForm ", { data, safeData })
        } 
    
        const comment = new Comment({
            author: req.user._id,
            blog: req.params.blogId,
            publish_date: Date.now(),
            content: entities.encodeHTML(content),
            likes: 0,
            dislikes: 0,
        });

        await comment.save();

        res.end()
    }),
];