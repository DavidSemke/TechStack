const userController = require('../controllers/user')
const express = require("express")
const router = express.Router()


router.get("/", function (req, res, next) {
  res.render(
    "pages/signupForm", 
    { 
      title: "Sign Up"
    }
  )
})

router.post("/", userController.postUser)

module.exports = router