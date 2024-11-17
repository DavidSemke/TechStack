const controller = require("../controllers/signup")
const express = require("express")
const router = express.Router()

router.get("/", controller.getSignup)

router.post("/", controller.postSignup)

module.exports = router
