const express = require("express")
const router = express.Router()


router.get("/", function (req, res, next) {
  res.render("index", { title: "Blogger" })
})


router.get("/:id", function (req, res, next) {
    res.render("index", { title: "Blogger" })
})

router.post("/", function (req, res, next) {
    res.render("index", { title: "Blogger" })
})

router.put("/:id", function (req, res, next) {
    res.render("index", { title: "Blogger" })
})

router.delete("/:id", function (req, res, next) {
    res.render("index", { title: "Blogger" })
})


module.exports = router