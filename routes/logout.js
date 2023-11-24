const controller = require('../controllers/logout')
const express = require("express")
const router = express.Router()

router.get("/", controller.getLogout);

module.exports = router 