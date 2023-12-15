const controller = require('../controllers/blogPosts')
const express = require("express")
const router = express.Router()

router.get("/:blogPostId", controller.getBlogPost)

router.post("/:blogPostId/comments", controller.postComment)

module.exports = router