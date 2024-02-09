const controller = require('../controllers/users')
const express = require("express")
const router = express.Router()
const upload = require('../utils/upload')
const utils = require('./utils/router')
const BlogPost = require("../models/blogPost");
const Comment = require("../models/comment");
const Reaction = require("../models/reaction");


router.use((req, res, next) => {
    req.documents = {}
    next()
})

// Users can only manipulate private blogs that they authored
router.use(
    '/:username/blog-posts/:blogPostId',
    (req, res, next) => {
        utils.setObjectIdDocument(
            'params',
            'blogPostId',
            [BlogPost],
            {
                author: req.user._id,
                $or: [
                    { public_version: { $exists: true } },
                    { publish_date: { $exists: false } }
                ]
            },
            ['public_version']
        )(req, res, next)
    }
)

router.use(
    '/:username/reactions',
    utils.setObjectIdDocument(
        'body',
        'content-id',
        [BlogPost, Comment]
    )
)

router.use(
    '/:username/reactions/:reactionId',
    utils.setObjectIdDocument(
        'params',
        'reactionId',
        Reaction
    )
)

// view depends on if user is loginUser
router.get(
    '/:username', 
    controller.getUser
)

// all other paths require auth
router.use(utils.checkAuthorization)

router.put(
    '/:username',
    upload.single('profile-pic'),
    utils.handleMulterError, 
    controller.updateUser
)

router.get(
    '/:username/blog-posts', 
    controller.getBlogPosts
)

router.post(
    '/:username/blog-posts',
    upload.single('thumbnail'),
    utils.handleMulterError,
    controller.postBlogPost
)

router.get(
    '/:username/blog-posts/new-blog-post',
    controller.getBlogPostCreateForm
)

router.post(
    '/:username/reactions',
    upload.none(),
    controller.postReaction
)

router.put(
    '/:username/reactions/:reactionId',
    upload.none(),
    controller.updateReaction
)

router.delete(
    '/:username/reactions/:reactionId',
    upload.none(),
    controller.deleteReaction
)

router.get(
    '/:username/blog-posts/:blogPostId', 
    controller.getBlogPostUpdateForm
)

router.put(
    '/:username/blog-posts/:blogPostId',
    upload.single('thumbnail'),
    utils.handleMulterError, 
    controller.updateBlogPost
)

router.delete(
    '/:username/blog-posts/:blogPostId', 
    controller.deletePrivateBlogPost
)

module.exports = router