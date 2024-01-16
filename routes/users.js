const controller = require('../controllers/users')
const express = require("express")
const router = express.Router()
const multer = require('multer')
const upload = require('../utils/upload')

function checkAuthorization(req, res, next) {
    if (
        !req.user
        || req.user.username !== req.params.username
    ) {
        
        const err = new Error("Given URL excludes current user.")
        err.status = 403;
        
        return next(err);
    }
}

// catch possible multer limit error
function handleMulterError(err, req, res, next) {
    if (!err) {
        return next()
    }

    if (err instanceof multer.MulterError) {
        req.fileLimitError = err
        next()
    }
    else {
        next(err)
    }
}

// view depends on if user is mainUser
router.get(
    '/:username', 
    controller.getUser
)

router.put(
    '/:username',
    // checkAuthorization,
    upload.single('profile-pic'),
    handleMulterError, 
    controller.updateUser
)

// view depends on if user is mainUser ??? Not implemented
router.get(
    '/:username/blog-posts',
    // checkAuthorization, 
    controller.getBlogPosts
)

router.post(
    '/:username/blog-posts',
    // checkAuthorization,
    upload.single('thumbnail'),
    handleMulterError,
    controller.postBlogPost
)

router.get(
    '/:username/blog-posts/new-blog-post',
    // checkAuthorization,
    controller.getBlogPostCreateForm
)

router.get(
    '/:username/blog-posts/:blogPostId',
    // checkAuthorization, 
    controller.getBlogPostUpdateForm
)

router.put(
    '/:username/blog-posts/:blogPostId',
    // checkAuthorization,
    upload.single('thumbnail'),
    handleMulterError, 
    controller.updateBlogPost
)

router.delete(
    '/:username/blog-posts/:blogPostId',
    // checkAuthorization, 
    controller.deleteBlogPost
)

router.post(
    '/:username/reactions',
    // checkAuthorization,
    upload.none(),
    controller.postReaction
)

router.put(
    '/:username/reactions/:reactionId',
    // checkAuthorization,
    upload.none(),
    controller.updateReaction
)

router.delete(
    '/:username/reactions/:reactionId',
    // checkAuthorization,
    upload.none(),
    controller.deleteReaction
)

module.exports = router