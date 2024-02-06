const controller = require('../controllers/blogPosts')
const express = require("express")
const router = express.Router()
const upload = require('../utils/upload')
const utils = require('../utils/router')

// this route is used for querying blog posts from navbar searchbar
router.get(
    "/", 
    controller.queryBlogPosts
)

// All other routes specify a blog post, which must be validated
router.use(
    utils.setParamBlogPost(
        {
            public_version: { $exists: false },
            publish_date: { $exists: true }
        },
        ['author']
    )
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