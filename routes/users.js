const controller = require('../controllers/user')
const express = require("express")
const router = express.Router()

// post user found in signup router

router.get('/:username', controller.getUser)

module.exports = router