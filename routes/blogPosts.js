const controller = require('../controllers/blogPosts')
const express = require("express")
const router = express.Router()
const upload = require('../utils/upload')

// this route is used for querying blog posts from navbar searchbar
router.get(
    "/", 
    controller.queryBlogPosts
)

router.get(
    "/:blogPostId", 
    controller.getBlogPost
)

router.post(
    "/:blogPostId/comments",
    upload.none(), 
    controller.postComment
)

module.exports = router