const controller = require('../controllers/users')
const express = require("express")
const router = express.Router()

router.get('/:username', controller.getUser)

// router.get('/:username/blogs', controller.getBlogs)

router.get('/:username/blogs/new-blog', controller.getBlogCreateForm)

router.post('/:username/blogs', controller.postBlog)

router.get('/:username/blogs/:blogId', controller.getBlogUpdateForm)

router.put('/:username/blogs/:blogId', controller.updateBlog)

router.delete('/:username/blogs/:blogId', controller.deleteBlog)

// router.get('/:username/blogs/:blogId/comments', controller.getComments)

// router.delete('/:username/blogs/:blogId/comments/:commentId', controller.deleteComment)

module.exports = router