const Blog = require('../models/blog.js')
const Comment = require('../models/comment.js')
const asyncHandler = require("express-async-handler");
const ents = require('../utils/htmlEntities')
const _ = require('lodash')
// for testing
const blog = require('../test/mocks/blogs.js')

exports.getIndex = asyncHandler(async (req, res, next) => {
    // const blogs = await Blog
    // .find()
    // .sort({ likes: 'desc' })
    // .exec();
  
    // completeBlogs = []
    
    // for (const blog of blogs) {
    //     const blogComments = await Comment
    //     .find({blog: blog._id})
    //     .exec()
        
    //     completeBlogs.push({ 
    //     ...blog, 
    //     commentCount: blogComments.length
    //     })
    // }

    const safeData = {
        title: "Tech Stack",
        blogs: [blog, blog]
    }
    const data = _.cloneDeep(safeData)
    ents.decodeObject(
        data,
        (key, value) => key !== 'thumbnail' && key !== 'profile_pic'
    )
    
    res.render("pages/index", { data, safeData })
})