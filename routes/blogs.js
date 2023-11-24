const express = require("express")
const router = express.Router()
const controller = require('../controllers/blog')

router.get("/:id", function (req, res, next) {
    controller.getBlog
})

router.get("/create", function (req, res, next) {
    controller.getBlogCreateForm
})

router.post("/create", function (req, res, next) {
    controller.postBlog
})

module.exports = router