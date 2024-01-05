const BlogPost = require('../models/blogPost')
const Comment = require('../models/comment')
const asyncHandler = require("express-async-handler");
const ents = require('../utils/htmlEntities')
const dateFormat = require('../utils/dateFormat')

exports.getIndex = asyncHandler(async (req, res, next) => {
    const blogPosts = await BlogPost
        .find({
            public_version: { $exists: false },
            publish_date: { $exists: true } 
        })
        .sort({ likes: 'desc' })
        .populate('author')
        .lean()
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