const controller = require('../controllers/users')
const express = require("express")
const router = express.Router()
const upload = require('../utils/upload')
const utils = require('../utils/router')

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

// All other routes specify a blog post, which must be validated
// Users can only manipulate private blogs that they authored
router.use((req, res, next) => {
    utils.setParamBlogPost(
        {
            author: req.user._id,
            $or: [
                { public_version: { $exists: true } },
                { publish_date: { $exists: false } }
            ]
        },
        ['public_version']
    )(req, res, next)
})

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