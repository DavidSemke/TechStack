const BlogPost = require('../models/blogPost')
const Comment = require('../models/comment')
const asyncHandler = require("express-async-handler");
const ents = require('../utils/htmlEntities')
const _ = require('lodash')
// for testing
const blogPost = require('../test/mocks/blogPosts')

exports.getIndex = asyncHandler(async (req, res, next) => {
    // const blogPosts = await BlogPost
    // .find()
    // .sort({ likes: 'desc' })
    // .exec();
  
    // completeBlogPosts = []
    
    // for (const blogPost of blogPosts) {
    //     const blogPostComments = await Comment
    //     .find({blogPost: blogPost._id})
    //     .exec()
        
    //     completeBlogPosts.push({ 
    //     ...blogPost, 
    //     commentCount: blogPostComments.length
    //     })
    // }

    const safeData = {
        title: "Tech Stack",
        blogPosts: [blogPost, blogPost]
    }
    const data = _.cloneDeep(safeData)
    ents.decodeObject(
        data,
        (key, value) => key !== 'thumbnail' && key !== 'profile_pic'
    )
    
    res.render("pages/index", { data, safeData })
})