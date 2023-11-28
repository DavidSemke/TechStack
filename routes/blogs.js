const controller = require('../controllers/blogs')
const express = require("express")
const router = express.Router()

router.get("/:blogId", controller.getBlog)

router.post("/:blogId/comments", controller.postComment)

module.exports = router