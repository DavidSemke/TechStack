const controller = require('../controllers/blog')
const express = require("express")
const router = express.Router()

router.get("/:id", controller.getBlog)

router.get("/create", controller.getBlogCreateForm)

router.post("/create", controller.postBlog)

module.exports = router