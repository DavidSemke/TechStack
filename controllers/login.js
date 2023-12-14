const passport = require('../utils/auth')
const entities = require('entities')
const ents = require('../utils/htmlEntities')
const _ = require('lodash')

exports.getLogin = (req, res, next) => {
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

    const data = {
      title: "Log In",
      inputs: inputs,
      errors: errors
    }
    const safeData = _.cloneDeep(data)
    ents.encodeObject(safeData)

    res.render("pages/loginForm", { data, safeData })
}

exports.postLogin = [
    function (req, res, next) {
      // save input into session
      req.session.username = req.body.username
      req.session.password = req.body.password

      next()
    },
    passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/login',
      failureFlash: true,
    }),
]