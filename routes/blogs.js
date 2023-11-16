const express = require("express")
const router = express.Router()
const controller = require('../controllers/blog')

router.get('/', function (req, res, next) { 
    controller.getBlogs 
})

router.get("/create", function (req, res, next) {
    controller.getBlogCreateForm
})

router.post("/create", function (req, res, next) {
    controller.postBlog
})

router.get("/:id", function (req, res, next) {
    controller.getBlog
})


module.exports = router