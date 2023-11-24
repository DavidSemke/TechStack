const express = require("express")
const router = express.Router()
const controller = require('../controllers/user')

// post user found in signup router

router.get('/:username', controller.getUser)

module.exports = router