const BlogPost = require("../models/blogPost");
const Comment = require("../models/comment");
const Reaction = require("../models/reaction");
const ReactionCounter = require("../models/reactionCounter");
const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const ents = require('../utils/htmlEntities')
const dateFormat = require('../utils/dateFormat')
const path = require('path')
const pug = require('pug')
const { Types } = require('mongoose')

  
// Display blog post
exports.getBlogPost = asyncHandler(async (req, res, next) => {
    const blogPostId = new Types.ObjectId(req.params.blogPostId)
  
    const blogPost = await BlogPost
        .findById(blogPostId)
        .populate('author')
        .lean()
        .exec()

    if (blogPost === null) {
        const err = new Error("Blog post not found");
        err.status = 404;
        
        return next(err);
    }

    const [comments, reactionCounter] = await Promise.all([
        Comment.find({ 
            blogPost: blogPostId
        })
            .populate('author')
            .lean()
            .exec(),
        ReactionCounter.findOne({
            content: {
                content_type: 'BlogPost',
                content_id: blogPostId
            }
        })
            .lean()
            .exec()
    ])

    blogPost.publish_date = dateFormat.formatDate(
        blogPost.publish_date
    )
    blogPost.likes = reactionCounter.like_count
    blogPost.dislikes = reactionCounter.dislike_count

    if (req.user) {
        // Add reaction data if current user reacted to blog post
        blogPost.reaction = await Reaction.findOne({
            user: req.user._id,
            content: {
                content_type: 'BlogPost',
                content_id: blogPost._id
            }
        })
            .lean()
            .exec()

        // Add blog post to current user's recently read list
        // Only do this if the blog post's author is not current user
        if (blogPost.author._id !== req.user._id) {
            const recentlyRead = req.user.blog_posts_recently_read
            const recentlyReadTotal = recentlyRead.unshift(blogPost._id)

            // enforce a maximum of 10 blog posts in recently read
            if (recentlyReadTotal > 10) {
                recentlyRead.pop()
            }

            await User.findOneAndUpdate(
                { _id: req.user._id },
                { blog_posts_recently_read: recentlyRead }
            )
        }
    }
    
    const replyMap = {};
    const nonReplies = []

    for (const comment of comments) {
        const reactionCounter = await ReactionCounter.findOne({
            content: {
                content_type: 'Comment',
                content_id: comment._id
            }
        })
            .lean()
            .exec()

        comment.publish_date = dateFormat.formatDate(
            comment.publish_date
        )
        comment.likes = reactionCounter.like_count
        comment.dislikes = reactionCounter.dislike_count

        // check if current user reacted to comment
        if (req.user) {
            comment.reaction = await Reaction.findOne({
                user: req.user._id,
                content: {
                    content_type: 'Comment',
                    content_id: comment._id
                }
            })
                .lean()
                .exec()
        }

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
        blogPost,
        mainUser: req.user
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
        const blogPostId = new Types.ObjectId(req.params.blogPostId)
        const content = req.body.content
        const replyTo = req.body['reply-to']
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.json({ errors: errors.array() })
        } 
        else {
            const commentData = {
                blogPost: blogPostId,
                publish_date: Date.now(),
                content: ents.encode(content),
            }

            if (req.user) {
                commentData.author = req.user._id
            }

            if (replyTo) {
                commentData.reply_to = replyTo
            }

            let comment = new Comment(commentData)
            await comment.save()
            
            comment = await Comment
                .findById(comment._id)
                .populate('author')
                .lean()
                .exec()
            comment.publish_date = dateFormat.formatDate(
                comment.publish_date
            )
            comment.likes = 0
            comment.dislikes = 0
            comment.replies = []

            const reactionCounter = new ReactionCounter({
                content: {
                    content_type: 'Comment',
                    content_id: comment._id
                },
                like_count: 0,
                dislike_count: 0
            })
            await reactionCounter.save()

            const mixinPath = path.join(
                process.cwd(),
                'views',
                'components',
                'card',
                'commentCard.pug'
            )
            const pugString = `include ${mixinPath}\n+commentCard(comment, isReply)`
            const template = pug.compile(
                pugString,
                { filename: 'commentCardTemplate' }
            )
            const isReply = Boolean(replyTo)
            const renderedHTML = template({
                comment,
                isReply 
            })
            
            res.json({ renderedHTML, commentData: comment })
        }
    }),
];