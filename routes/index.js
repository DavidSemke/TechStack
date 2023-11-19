const Blog = require('../models/blog.js')
const Comment = require('../models/comment.js')
const express = require("express")
const router = express.Router()

/* GET home page. */
router.get("/", async function (req, res, next) {
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

module.exports = router
