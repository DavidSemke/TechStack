const Blog = require('../models/blog.js')
const Comment = require('../models/comment.js')
const asyncHandler = require("express-async-handler");

exports.getIndex = asyncHandler(async (req, res, next) => {
    const blogs = await Blog
    .find()
    .sort({ likes: 'desc' })
    .exec();
  
    completeBlogs = []
    
    for (const blog of blogs) {
        const blogComments = await Comment
        .find({blog: blog._id})
        .exec()
        
        completeBlogs.push({ 
        ...blog, 
        commentCount: blogComments.length
        })
    }
    
    res.render(
        "pages/index", 
        { 
        title: "Tech Stack",
        blogs: completeBlogs
        }
    )
})