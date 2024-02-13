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
function setPrivateBlogPost(req, res, next) {
    utils.setObjectIdDocument(
        'params',
        'blogPostId',
        BlogPost,
        (blogPost) => {
            return (
                blogPost.author.toString() !== req.user._id.toString()
                || (!blogPost.public_version && blogPost.publish_date)
            )
        },
        ['public_version']
    )(req, res, next)
}

function setReaction(req, res, next) {
    utils.setObjectIdDocument(
        'params',
        'reactionId',
        Reaction,
        (reaction) => {
            return (
                req.user._id.toString() !== reaction.user.toString()
            )
        }
    )(req, res, next)
}

async function setReactionContent(req, res, next) {
    let contentModel
    const isBlogPost = req.body['content-type'] === 'BlogPost'
    const isComment = req.body['content-type'] === 'Comment'

    if (isBlogPost) {
        contentModel = BlogPost
    }
    else if (isComment) {
        contentModel = Comment
    }
    else {
        // 400 error will be thrown in next middleware
        return next()
    }

    utils.setObjectIdDocument(
        'body',
        'content-id',
        contentModel,
        async (content) => {
            const method = req.method.toLowerCase()
            let preExistingReaction = false

            if (method === 'post') {
                const reaction = await Reaction
                    .findOne({
                        user: req.user._id,
                        content: {
                            content_type: req.body['content-type'],
                            content_id: content._id
                        }
                    })
                    .lean()
                    .exec()
                
                if (reaction !== null) {
                    preExistingReaction = true
                }
            }

            const isNotPublicBlogPost = (
                isBlogPost 
                && (
                    content.public_version 
                    || !content.publish_date
                )
            )

            return preExistingReaction || isNotPublicBlogPost
        }
    )(req, res, next)
}

// View depends on if user is loginUser
router.get(
    '/:username', 
    controller.getUser
)

// All other paths require auth
router.use(
    '/:username',
    utils.checkAuthorization
)

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
    setReactionContent,
    controller.postReaction
)

router.put(
    '/:username/reactions/:reactionId',
    upload.none(),
    setReaction,
    setReactionContent,
    controller.updateReaction
)

router.delete(
    '/:username/reactions/:reactionId',
    upload.none(),
    setReaction,
    setReactionContent,
    controller.deleteReaction
)

router.get(
    '/:username/blog-posts/:blogPostId',
    setPrivateBlogPost, 
    controller.getBlogPostUpdateForm
)

router.put(
    '/:username/blog-posts/:blogPostId',
    upload.single('thumbnail'),
    utils.handleMulterError,
    setPrivateBlogPost, 
    controller.updateBlogPost
)

router.delete(
    '/:username/blog-posts/:blogPostId',
    setPrivateBlogPost, 
    controller.deletePrivateBlogPost
)

module.exports = router