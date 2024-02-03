const BlogPost = require("../models/blogPost");
const Comment = require("../models/comment");
const ReactionCounter = require("../models/reactionCounter");
const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const dateFormat = require('../utils/dateFormat')
const query = require('../utils/query')
const createDOMPurify = require('dompurify')
const { JSDOM } = require('jsdom')
const path = require('path')
const pug = require('pug')
const { Types } = require('mongoose')


exports.queryBlogPosts = asyncHandler(async (req, res, next) => {
    const keywordsParam = req.query.keywords

    if (!keywordsParam) {
        const err = new Error("Query parameter 'keywords' not found.");
        err.status = 400;
        
        return next(err)
    }

    const keywords = keywordsParam.split(',')
    const queryConditions = []

    for (const keyword of keywords) {
        queryConditions.push({
            $or: [
                { title: { $regex: new RegExp(keyword, 'i') } },
                { keywords: { $regex: new RegExp(`^${keyword}$`, 'i') } }
            ]
        })
    }

    const finalQuery = {
        $and: queryConditions,
        public_version: { $exists: false },
        publish_date: { $exists: true } 
    }
    
    const blogPosts = await BlogPost
        .find(finalQuery)
        .lean()
        .exec()
    
    const pugPath = path.join(
        process.cwd(),
        'views',
        'components',
        'toolbar',
        'navbarDropdown.pug'
    )
    const template = pug.compileFile(pugPath)
    const renderedHTML = template({
        blogPosts 
    })
    
    res.json({ renderedHTML })
})
  
// Display blog post
exports.getBlogPost = asyncHandler(async (req, res, next) => {
    let blogPostId

    try {
        blogPostId = new Types.ObjectId(req.params.blogPostId)
    }
    catch (error) {
        const err = new Error("Invalid ObjectId format");
        err.status = 400;

        return next(err)
    }

    let blogPost = await BlogPost
        .findById(blogPostId)
        .populate('author')
        .lean()
        .exec()

    if (blogPost === null) {
        const err = new Error("Blog post not found");
        err.status = 404;
        
        return next(err);
    }

    blogPost = await query.completeBlogPost(blogPost, req.user)

    if (req.user) {
        // Add blog post to current user's recently read list
        // Only do this if the blog post's author is not current user
        // If the blog post is already in the list, remove it and place
        // it at the front
        if (blogPost.author._id.toString() !== req.user._id.toString()) {
            let recentlyRead = req.user.blog_posts_recently_read
            recentlyRead = recentlyRead.filter(
                recentRead => recentRead._id.toString() !== blogPost._id.toString()
            )
            const recentlyReadTotal = recentlyRead.unshift(blogPost._id)

            // enforce a maximum of 5 blog posts in recently read
            if (recentlyReadTotal > 5) {
                recentlyRead.pop()
            }

            await User.findOneAndUpdate(
                { _id: req.user._id },
                { blog_posts_recently_read: recentlyRead }
            )
        }
    }

    const data = {
        title: blogPost.title,
        blogPost,
        loginUser: req.user
    }

    res.render("pages/blogPost", { data });
});
    
// On comment create
exports.postComment = [
    body("content")
        .isString()
        .withMessage(
            'Comment must be a string.'
        )
        .trim()
        .isLength({ min: 1, max: 300 })
        .withMessage(
            "Comment must be 1 to 300 characters."
        ),

    asyncHandler(async (req, res, next) => {
        let blogPostId, replyTo

        try {
            blogPostId = new Types.ObjectId(req.params.blogPostId)

            if (req.body['reply-to']) {
                replyTo = new Types.ObjectId(req.body['reply-to'])
            }
        }
        catch (error) {
            const err = new Error("Invalid ObjectId format");
            err.status = 400;

            return next(err)
        }
        
        const content = req.body.content
        const errors = validationResult(req).array();

        if (errors.length) {
            res.status(400).json({ errors })
            return
        } 

        const window = new JSDOM('').window;
        const DOMPurify = createDOMPurify(window);
        const pureContent = DOMPurify.sanitize(content);

        const commentData = {
            blog_post: blogPostId,
            publish_date: Date.now(),
            content: pureContent
        }

        commentData.author = req.user ? req.user._id : undefined
        
        if (replyTo) {
            const commentRepliedTo = await Comment
                .findById(replyTo)
                .lean()
                .exec()
            
            if (commentRepliedTo.reply_to) {
                const err = new Error("Cannot reply to a reply");
                err.status = 400;

                return next(err)
            }
            
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
    })
];