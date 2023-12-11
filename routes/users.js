const controller = require('../controllers/users')
const express = require("express")
const router = express.Router()
const multer = require('multer')
const upload = require('../upload/multer')

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

// view depends on if user is mainUser
router.get(
    '/:username/blogs', 
    controller.getBlogs
)

router.post(
    '/:username/blogs',
    // checkAuthorization,
    upload.single('thumbnail'),
    handleMulterError,
    controller.postBlog
)

router.get(
    '/:username/blogs/new-blog',
    // checkAuthorization,
    controller.getBlogCreateForm
)

router.get(
    '/:username/blogs/:blogId',
    // checkAuthorization, 
    controller.getBlogUpdateForm
)

router.put(
    '/:username/blogs/:blogId',
    // checkAuthorization, 
    controller.updateBlog
)

router.delete(
    '/:username/blogs/:blogId',
    // checkAuthorization, 
    controller.deleteBlog
)

module.exports = router