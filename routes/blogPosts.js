const controller = require('../controllers/blogPosts')
const express = require("express")
const router = express.Router()
const upload = require('../utils/upload')
const utils = require('./utils/router')
const BlogPost = require("../models/blogPost");
const Comment = require("../models/comment");


router.use((req, res, next) => {
    req.documents = {}
    next()
})

router.use(
    "/:blogPostId",
    utils.setObjectIdDocument(
        'params',
        'blogPostId',
        [BlogPost],
        {
            public_version: { $exists: false },
            publish_date: { $exists: true }
        },
        ['author']
    )
)

router.use(
    "/:blogPostId/comments",
    (req, res, next) => {
        if (req.body['reply-to'] === undefined) {
            return next()
        }

        utils.setObjectIdDocument(
            'body',
            'reply-to',
            [Comment]
        )(req, res, next)
    }
    
)

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