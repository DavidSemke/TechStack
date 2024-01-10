const BlogPost = require("../models/blogPost");
const Comment = require("../models/comment");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const ents = require('../utils/htmlEntities')
const dateFormat = require('../utils/dateFormat')

  
// Display blog post
exports.getBlogPost = asyncHandler(async (req, res, next) => {
  
    const [blogPost, comments] = await Promise.all([
        BlogPost.findById(req.params.blogPostId)
            .populate('author')
            .lean()
            .exec(),
        Comment.find({ 
            blogPost: req.params.blogPostId
        })
            .populate('author')
            .lean()
            .exec(),
    ]);

    if (blogPost === null) {
        const err = new Error("Blog post not found");
        err.status = 404;
        
        return next(err);
    }

    blogPost.publish_date = dateFormat.formatDate(
        blogPost.publish_date
    )

    const replyMap = {};
    const nonReplies = []

    for (const comment of comments) {
        comment.publish_date = dateFormat.formatDate(
            comment.publish_date
        )

        if ('reply_to' in comment) {
            
            if (!(comment.reply_to in replyMap)) {
                replyMap[comment.reply_to] = []
            }

            replyMap[comment.reply_to].push(comment)
        }
        else {
            nonReplies.push(comment)
            replyMap[comment._id] = []
        }
    }

    for (const nonReply of nonReplies) {
        nonReply.replies = replyMap[nonReply._id]
    }

    blogPost.comments = nonReplies

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
        const replyTo = req.body['reply-to']
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() })
        } 
        else {
            const commentData = {
                author: req.user._id,
                blogPost: req.params.blogPostId,
                publish_date: Date.now(),
                content: ents.encode(content),
                likes: 0,
                dislikes: 0,
            }

            if (replyTo) {
                commentData.reply_to = replyTo
            }

            const comment = new Comment({ commentData });
            await comment.save();
    
            res.end()
        }
    }),
];