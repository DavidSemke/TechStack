const controller = require('../controllers/users')
const express = require("express")
const router = express.Router()
const multer = require('multer')
const upload = require('../upload/multer')

router.get(
    '/:username', 
    controller.getUser
)

// router.get(
//     '/:username/blogs', 
//     controller.getBlogs
// )

router.post(
    '/:username/blogs',
    upload.single('thumbnail'),
    // catch possible multer limit error
    function (err, req, res, next) {
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
    },
    controller.postBlog
)

router.get(
    '/:username/blogs/new-blog',
    controller.getBlogCreateForm
)

router.get(
    '/:username/blogs/:blogId', 
    controller.getBlogUpdateForm
)

router.put(
    '/:username/blogs/:blogId', 
    controller.updateBlog
)

router.delete(
    '/:username/blogs/:blogId', 
    controller.deleteBlog
)

// router.get(
//     '/:username/blogs/:blogId/comments', 
//     controller.getComments
// )

// router.delete(
//     '/:username/blogs/:blogId/comments/:commentId', 
//     controller.deleteComment
// )

module.exports = router
