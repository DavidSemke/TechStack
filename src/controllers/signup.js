const User = require("../models/user")
const bcrypt = require("bcryptjs")
const asyncHandler = require("express-async-handler")
const { validationResult } = require("express-validator")
const createDOMPurify = require("dompurify")
const { JSDOM } = require("jsdom")
const userVal = require("../validation/user")

exports.getSignup = asyncHandler(async (req, res, next) => {
  const data = {
    title: "Sign Up",
    inputs: {},
    errors: [],
  }

  res.render("pages/signupForm", { data })
})

exports.postSignup = [
  ...userVal.userSignup,

  asyncHandler(async (req, res, next) => {
    const window = new JSDOM("").window
    const DOMPurify = createDOMPurify(window)
    const inputs = {
      username: DOMPurify.sanitize(req.body.username),
      password: DOMPurify.sanitize(req.body.password),
    }

    const errors = validationResult(req).array()

    if (errors.length) {
      const data = {
        title: "Sign Up",
        inputs,
        errors,
      }

      res.status(400).render("pages/signupForm", { data })
      return
    }

    bcrypt.hash(req.body.password, 10, async (err, hash) => {
      if (err) {
        return next(err)
      }

      try {
        const userData = {
          username: req.body.username,
          password: hash,
        }
        const user = new User(userData)
        await user.save()

        // login user
        const loginUser = await User.findById(user._id)
          .populate("blog_posts_recently_read")
          .populate({
            path: "blog_posts_recently_read",
            populate: {
              path: "author",
            },
          })
          .lean()
          .exec()

        req.login(loginUser, (err) => {
          if (err) {
            return next(err)
          }
        })

        res.redirect("/")
      } catch (err) {
        return next(err)
      }
    })
  }),
]
