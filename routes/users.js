const express = require("express")
const router = express.Router()
const controller = require('../controllers/blog')

router.get('/:username/profile', function (req, res, next) { 
    controller.getBlogs 
})


module.exports = router