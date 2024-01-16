const BlogPost = require('../models/blogPost')
const Comment = require('../models/comment')
const ReactionCounter = require('../models/reactionCounter')
const asyncHandler = require("express-async-handler");
const ents = require('../utils/htmlEntities')
const dateFormat = require('../utils/dateFormat')

exports.getIndex = asyncHandler(async (req, res, next) => {
    const blogPosts = await BlogPost
        .aggregate([
            {
                $match: {
                    public_version: { $exists: false },
                    publish_date: { $exists: true } 
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'author'
                }
            },
            {
                $lookup: {
                    from: 'reactionCounters',
                    localField: '_id',
                    foreignField: 'content.content_id',
                    as: 'reactionCounter'
                }
            },
            {
                $addFields: {
                    like_count: '$reactionCounter.like_count',
                    dislike_count: '$reactionCounter.dislike_count',
                }
            },
            {
                $sort: { like_count: -1 }
            }
        ])
        .exec();
    
    for (const blogPost of blogPosts) {
        const comments = await Comment
            .find({ blogPost: blogPost._id })
            .lean()
            .exec()
        blogPost.comments = comments

        if (blogPost.publish_date) {
            blogPost.publish_date = dateFormat.formatDate(
                blogPost.publish_date
            )
        }
        else {
            blogPost.publish_date = 'N/A'
        }
    }

    const safeData = {
        title: "Tech Stack",
        blogPosts
    }
    const data = ents.decodeObject(
        safeData,
        (key, value) => key !== 'thumbnail' && key !== 'profile_pic'
    )
    
    res.render("pages/index", { data, safeData })
})