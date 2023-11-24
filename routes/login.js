const express = require("express")
const router = express.Router()

module.exports = function(passport) {
  router.get("/", function (req, res, next) {

    const inputs = {
      'username': req.session.username ?? '',
      'password': req.session.password ?? ''
    }

    let errors = []

    if (
      req.session.flash 
      && req.session.flash.error
      && req.session.flash.error.length
    ) {
      // In the event of password and username being wrong,
      // two identical error messages could appear.
      // This ensures only one is considered.
      errors = [req.session.flash.error[0]]
    }

    res.render(
      "pages/loginForm", 
      { 
        title: "Log In",
        inputs: inputs,
        errors: errors
      }
    )
  })
  
  router.post('/', [
    function (req, res, next) {
      req.session.username = req.body.username
      req.session.password = req.body.password
      next()
    },
    passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/login',
      failureFlash: true,
      }),
  ]);

  return router
}
