require('dotenv').config()
const RateLimit = require('express-rate-limit')
const compression = require('compression')
const helmet = require('helmet')
const crypto = require('crypto')
const createError = require("http-errors")
const express = require("express")
const path = require("path")
const cookieParser = require("cookie-parser")
const logger = require("morgan")
const session = require("express-session")
const passport = require('./utils/auth')
const flash = require('connect-flash')
const mongoSanitize = require('express-mongo-sanitize')
const query = require('./utils/query')
const BlogPost = require("./models/blogPost");
require('./mongoConfig')


const app = express()

/* Rate limiting */
// app.use(
//   // 20 requests per minute
//   RateLimit({
//     windowMs: 1*60*1000,
//     max: 1000
//   })
// )

/* Security Setup */
app.use((req, res, next) => {
  const nonce = crypto.randomBytes(16).toString('base64')
  res.locals.nonce = nonce

  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'", 
          `'nonce-${nonce}'`
        ]
      }
    }
  })(req, res, next)
})

/* View Engine Setup */
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "pug")

/* Authentication Setup */
app.use(session(
  { 
    secret: process.env.SESSION_SECRET, 
    resave: false, 
    saveUninitialized: true,
    cookie: {
      sameSite: 'lax'
    }
  }
));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// add user locals
app.use(async (req, res, next) => {
  if (!req.user) {
    return next()
  }

  res.locals.loginUser = req.user

  // Find up to 5 public blog posts not written by current user
  let suggestions = await BlogPost
    .find({ 
      author: { $ne: req.user._id },
      public_version: { $exists: false },
      publish_date: { $exists: true } 
    })
    .populate('author')
    .limit(5)
    .lean()
    .exec()
  
  suggestions = await Promise.all(
    suggestions.map((suggestion) => {
      return query.completeBlogPost(
        suggestion, req.user, false, false
      )
    })
  )

  res.locals.suggestions = suggestions
  next()
})

/* Miscellaneous Setup */
app.use(logger("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(mongoSanitize());

/* Response compression */
app.use(compression())

/* Static Setup */
app.use(
  express.static(path.join(
    __dirname, 
    "public"
  ))
)
app.use(
  '/tinymce', 
  express.static(path.join(
    __dirname, 
    'node_modules', 
    'tinymce'
  ))
);

/* Route Setup */
const indexRouter = require("./routes/index")
const signupRouter = require("./routes/signup")
const loginRouter = require("./routes/login")
const logoutRouter = require("./routes/logout")
const usersRouter = require("./routes/users")
const blogPostsRouter = require("./routes/blogPosts")

app.use("/", indexRouter)
app.use("/signup", signupRouter)
app.use("/login", loginRouter)
app.use("/logout", logoutRouter)
app.use("/users", usersRouter)
app.use("/blog-posts", blogPostsRouter)

/* Error Handling */
app.use(function (req, res, next) {
  next(createError(404))
})

app.use(function (err, req, res, next) {
  const status = err.status || 500
  let statusText, subtext

  switch(status) {
    case 400:
      statusText = 'Bad Request'
      subtext = 'Your request was not understood.'
      break
    case 403:
      statusText = 'Access Forbidden'
      subtext = 'Have you tried logging in?'
      break
    case 404:
      statusText = 'Not Found'
      subtext = 'There is nothing here! Make sure to double-check the url.'
      break
    default:
      statusText = 'Internal Server Error'
      subtext = 'An unknown error occurred! Please refresh the page or return later.'
  }

  data = { 
    title: `${status} Error - ${statusText}`, 
    subtext 
  }

  res.status(status).render("pages/error", { data })
})


module.exports = app