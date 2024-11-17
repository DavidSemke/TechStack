const controller = require("../controllers/login")
const express = require("express")
const router = express.Router()

router.get("/", controller.getLogin)

router.post("/", controller.postLogin)

module.exports = router
