const User = require("../../models/user")
const BlogPost = require("../../models/blogPost")
const asyncHandler = require("express-async-handler")
const { validationResult } = require("express-validator")
const createDOMPurify = require("dompurify")
const { JSDOM } = require("jsdom")
const userValidation = require("../../validation/user")

// Display user profile
// Usernames are unique, and so they are used as ids
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ username: req.params.username })
    .populate("blog_posts_recently_read")
    .populate({
      path: "blog_posts_recently_read",
      populate: {
        path: "author",
      },
    })
    .lean()
    .exec()

  if (user === null) {
    const err = new Error("User not found")
    err.status = 404

    return next(err)
  }

  // Find public blog posts only
  user.blog_posts_written = await BlogPost.find({
    author: user._id,
    public_version: { $exists: false },
    publish_date: { $exists: true },
  })
    .lean()
    .exec()

  let title = `${user.username}'s Profile`
  let isLoginUserProfile = false

  if (req.user && user._id.toString() === req.user._id.toString()) {
    title = "Your Profile"
    isLoginUserProfile = true
  }

  const data = {
    title,
    user,
    isLoginUserProfile,
  }

  res.render("pages/userProfile", { data })
})

exports.updateUser = [
  // Files processed after validation middleware
  ...userValidation.userUpdate,

  asyncHandler(async (req, res, next) => {
    const errors = []

    if (req.fileTypeError) {
      errors.push({
        path: "profile-pic",
        msg: "File must be jpeg, jpg, png, webp, or gif.",
      })
    } else if (req.fileLimitError) {
      errors.push({
        path: "profile-pic",
        msg: req.fileLimitError.message + ".",
      })
    }

    const window = new JSDOM("").window
    const DOMPurify = createDOMPurify(window)

    // Cannot repopulate profile-pic input with file, so it is
    // omitted here
    const inputs = {
      username: DOMPurify.sanitize(req.body.username),
      bio: DOMPurify.sanitize(req.body.bio),
      keywords: DOMPurify.sanitize(req.body.keywords),
    }

    const nonFileErrors = validationResult(req).array()
    errors.push(...nonFileErrors)

    if (errors.length) {
      res.status(400).json({ errors })
      return
    }

    const filter = {
      username: req.user.username,
    }
    const update = {
      username: inputs.username,
    }

    const { bio, keywords } = inputs
    update.bio = bio || undefined
    update.keywords = keywords ? keywords.split(" ") : undefined

    // add new profile pic to update if uploaded
    if (req.file) {
      update.profile_pic = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      }
    }

    const updatedUser = await User.findOneAndUpdate(filter, update, {
      new: true,
    })
      .lean()
      .exec()

    res.redirect(303, `/users/${updatedUser.username}`)
  }),
]
