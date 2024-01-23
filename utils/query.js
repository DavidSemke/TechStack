const Comment = require("../models/comment");
const Reaction = require("../models/reaction");
const ReactionCounter = require("../models/reactionCounter");
const dateFormat = require('../utils/dateFormat')


async function completeBlogPost(
    blogPost, mainUser, userReactions=true, binnedReplies=true
) {
    const [comments, reactionCounter] = await Promise.all([
        Comment.find({ 
            blogPost: blogPost._id
        })
            .populate('author')
            .lean()
            .exec(),
        ReactionCounter.findOne({
            content: {
                content_type: 'BlogPost',
                content_id: blogPost._id
            }
        })
            .lean()
            .exec()
    ])

    blogPost.last_modified_date = dateFormat.formatDate(
        blogPost.last_modified_date
    )

    if (blogPost.publish_date) {
        blogPost.publish_date = dateFormat.formatDate(
            blogPost.publish_date
        )
    }
    else {
        blogPost.publish_date = 'N/A'
    }

    blogPost.likes = reactionCounter.like_count
    blogPost.dislikes = reactionCounter.dislike_count

    if (mainUser && userReactions) {
        // Add reaction data if current user reacted to blog post
        blogPost.reaction = await Reaction.findOne({
            user: mainUser._id,
            content: {
                content_type: 'BlogPost',
                content_id: blogPost._id
            }
        })
            .lean()
            .exec()
    }

    // add blog post preview
    blogPost.preview = ''
    const match = blogPost.content.match(/<p.*?>(.*?)<\/p>/)

    if (match) {
        blogPost.preview = match[1]
    }
    
    if (!binnedReplies) {
        blogPost.comments = comments
        return
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
        if (mainUser && userReactions) {
            comment.reaction = await Reaction.findOne({
                user: mainUser._id,
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
}


module.exports = {
    completeBlogPost
}