const express = require("express")
const router = express.Router()

module.exports = function(passport) {
  router.get("/", function (req, res, next) {
    res.render("pages/loginForm", { title: "Login" })
  })
  
  router.post('/', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/'
  }));

  return router
}
