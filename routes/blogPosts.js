const controller = require('../controllers/blogPosts')
const express = require("express")
const router = express.Router()
const upload = require('../utils/upload')

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