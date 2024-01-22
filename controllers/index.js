const BlogPost = require('../models/blogPost')
const asyncHandler = require("express-async-handler");
const ents = require('../utils/htmlEntities')
const query = require('../utils/query')

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
        await query.completeBlogPost(
            blogPost, req.user, false, false
        )
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