require('dotenv').config()
const helmet = require('helmet')
const crypto = require('crypto')
const liveReload = require("livereload")
const connectLiveReload = require("connect-livereload")
const createError = require("http-errors")
const express = require("express")
const path = require("path")
const cookieParser = require("cookie-parser")
const logger = require("morgan")
const session = require("express-session")
const passport = require('./utils/auth')
const flash = require('connect-flash')
const mongoose = require("mongoose")
const mongoSanitize = require('express-mongo-sanitize')
const ents = require('./utils/htmlEntities')
const BlogPost = require("./models/blogPost");

// for testing
const User = require("./models/user");

/* MongoDB Setup */
const connecter = process.env.MONGO_DB_CONNECT

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(connecter);
}

const app = express()

/* Security Setup */
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'", 
          "'unsafe-inline'",
          "http://localhost:35729"
        ],
        connectSrc: ["'self'", "ws://localhost:35729"]
      }
    }
  })
)

//set CSP with nonce
// app.use((req, res, next) => {
//   const nonce = crypto.randomBytes(16).toString('base64');
//   res.setHeader(
//     'Content-Security-Policy', 
//     `script-src * 'unsafe-inline'`
//   );
//   res.locals.nonce = nonce;
//   next();
// })

/* View Engine Setup */
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "pug")

/* Live Reload Setup */
const liveReloadServer = liveReload.createServer()
liveReloadServer.watch(path.join(__dirname, 'public'))
liveReloadServer.server.once('connection', () => {
  setTimeout(() => {
    liveReloadServer.refresh('/')
  }, 100)
})

app.use(connectLiveReload())

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

/* FOR TESTING - AUTOLOGIN */
app.use(async (req, res, next) => {
  const autologUser = await User
    .findOne({ username: 'aaaaaa' })
    .populate('blog_posts_recently_read')
    .populate({
        path: 'blog_posts_recently_read',
        populate: {
            path: 'author'
        }
    })
    .lean()
    .exec();

  req.login(autologUser, (err) => {
    if (err) {
        return next(err)
    }
  })
  
  next()
})

// add user local
app.use((req, res, next) => {
  if (!req.user) {
    return next()
  }

  const rawUser = ents.decodeObject(
    req.user,
    (key, value) => key !== 'profile_pic' && key != 'thumbnail'
  )

  res.locals.mainUser = rawUser
  next()
})

// add user blog post suggestions local
app.use(async (req, res, next) => {
  if (!req.user) {
    return next()
  }

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

  suggestions = ents.decodeObject(
    suggestions,
    (key, value) => key !== 'profile_pic' && key != 'thumbnail'
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
app.use(
  '/entities',
  express.static(path.join(
    __dirname, 
    'node_modules', 
    'entities',
    'lib',
    'esm'
  ))
)

/* Route Setup */
const indexRouter = require("./routes/index")
const signupRouter = require("./routes/signup")
// passport is argument here to authenticate login
const loginRouter = require("./routes/login")(passport)
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
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get("env") === "development" ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render("pages/error")
})

module.exports = app
