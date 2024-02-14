const BlogPost = require('../models/blogPost')
const asyncHandler = require("express-async-handler");
const query = require('../utils/query')

exports.getIndex = asyncHandler(async (req, res, next) => {
    let blogPosts = await BlogPost
        .find({
            public_version: { $exists: false },
            publish_date: { $exists: true } 
        })
        .sort({ likes: 'desc' })
        .populate('author')
        .limit(6)
        .lean()
        .exec();
    
    blogPosts = await Promise.all(
        blogPosts.map((blogPost) => {
            return query.completeBlogPost(
                blogPost, req.user, false, false
            )
        })
    )

    const data = {
        title: "Tech Stack",
        blogPosts
    }
    
    res.render("pages/index", { data })
})