require("dotenv").config()
const express = require("express")
const createError = require("http-errors")
const path = require("path")
const session = require("express-session")
const flash = require("connect-flash")
const passport = require("../../utils/auth")
const base64 = require("../../utils/base64")

function create(router, routerPath, autologUser = null) {
  const app = express()

  /* View Engine Setup */
  app.set("views", path.join(process.cwd(), "views"))
  app.set("view engine", "pug")

  /* Authentication Setup */
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
      cookie: {
        sameSite: "lax",
      },
    }),
  )

  app.use(passport.initialize())
  app.use(passport.session())
  app.use(flash())

  if (autologUser) {
    app.use(async (req, res, next) => {
      autologUser.blog_posts_recently_read = []

      req.login(autologUser, (err) => {
        if (err) {
          return next(err)
        }
      })

      next()
    })
  }

  // add user locals
  app.use((req, res, next) => {
    if (!req.user) {
      return next()
    }

    res.locals.loginUser = req.user
    res.locals.suggestions = []

    next()
  })

  // add image locals
  app.use(async (req, res, next) => {
    const iconsPath = path.join(process.cwd(), "icons")
    res.locals.icons = await base64.imagesToBase64(iconsPath)
    next()
  })

  app.use(express.urlencoded({ extended: false }))

  /* Static Setup */
  app.use(express.static(path.join(__dirname, "public")))
  app.use(
    "/tinymce",
    express.static(path.join(__dirname, "node_modules", "tinymce")),
  )

  app.use(routerPath, router)

  /* Error Handling */
  app.use(function (req, res, next) {
    next(createError(404))
  })

  app.use(function (err, req, res, next) {
    res.locals.message = err.message
    res.locals.error = err

    // render the error page
    res.status(err.status || 500)
    res.render("pages/error")
  })

  return app
}

module.exports = {
  create,
}
