const passport = require('../utils/auth')
const createDOMPurify = require('dompurify')
const { JSDOM } = require('jsdom')


exports.getLogin = (req, res, next) => {
  const inputs = {
      username: req.session.username ?? '',
      password: req.session.password ?? ''
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

  const data = {
    title: "Log In",
    inputs,
    errors
  }

  res.render("pages/loginForm", { data })
}

exports.postLogin = [
    function (req, res, next) {
      const window = new JSDOM('').window;
      const DOMPurify = createDOMPurify(window);
  
      // save input into session
      req.session.username = DOMPurify.sanitize(req.body.username)
      req.session.password = DOMPurify.sanitize(req.body.password)

      next()
    },
    passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/login',
      failureFlash: true,
    }),
]