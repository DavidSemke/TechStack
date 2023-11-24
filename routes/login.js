const express = require("express")
const router = express.Router()

module.exports = function(passport) {
  router.get("/", function (req, res, next) {
    res.render(
      "pages/loginForm", 
      { 
        title: "Log In", 
        errors: req.session.messages 
      }
    )
  })
  
  router.post('/', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureMessage: true,
  }));

  return router
}
