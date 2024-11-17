const BlogPost = require("../../models/blogPost")
const ReactionCounter = require("../../models/reactionCounter")
const asyncHandler = require("express-async-handler")
const { validationResult } = require("express-validator")
const query = require("../../utils/query")
const createDOMPurify = require("dompurify")
const { JSDOM } = require("jsdom")
const blogPostValidation = require("../../validation/blogPost")

exports.getBlogPosts = asyncHandler(async (req, res, next) => {
  // Get all private blog posts
  // (Private blog post can be unpublished or edit of published)
  const privateBlogPosts = await BlogPost.find({
    author: req.user._id,
    $or: [
      { public_version: { $exists: true } },
      { publish_date: { $exists: false } },
    ],
  })
    .populate("public_version")
    .lean()
    .exec()

  const publishedBlogPosts = []
  const unpublishedBlogPosts = []

  await Promise.all(
    privateBlogPosts.map(async (blogPost) => {
      blogPost = await query.completeBlogPost(blogPost, req.user, false, false)

      if (blogPost.publish_date !== "N/A") {
        publishedBlogPosts.push(blogPost)
      } else {
        unpublishedBlogPosts.push(blogPost)
      }

      return blogPost
    }),
  )

  const data = {
    title: "Your Blog Posts",
    publishedBlogPosts,
    unpublishedBlogPosts,
  }

  res.render("pages/userBlogPosts", { data })
})

// Display blog post create form
exports.getBlogPostCreateForm = [
  function (req, res, next) {
    const data = {
      title: "Create Blog Post",
      blogPost: {},
    }

    res.render("pages/blogPostForm", { data })
  },
]

// On blog post create
exports.postBlogPost = [
  
  // TEMPORARY BLOCK - Prevent all other users from creating blog posts 
  // in production!!!
  asyncHandler((req, res, next) => {
    const isProd = process.env.NODE_ENV === "production"

    if (isProd && req.user.username !== 'Davsem') {
      const err = new Error("Action forbidden")
      err.status = 403

      return next(err)
    }

    next()
  }),

  // Files processed after validation middleware
  ...blogPostValidation.blogPost,

  asyncHandler(async (req, res, next) => {
    switch (req.body["pre-method"]) {
      case "discard":
        res.redirect(303, `/users/${req.user.username}/blog-posts`)
        break
      case "save":
        await post(req, res, ["title"])
        break
      case "publish":
        await post(req, res, null, true)
        break
      default: {
        const err = new Error(
          'Request body key "pre-method" must have value ' +
            '"discard", "save", or "publish".',
        )
        err.status = 400

        return next(err)
      }
    }

    // if validationPaths = null, all paths are considered
    async function post(req, res, validationPaths = null, publishing = false) {
      const data = await processBlogPostData(req, res, validationPaths)

      // data is undefined or an object
      if (!data) {
        return
      }

      // if pre-method = publish
      if (publishing) {
        data.publish_date = Date.now()

        const publicBlogPost = new BlogPost(data)
        await publicBlogPost.save()

        data.public_version = publicBlogPost._id

        // public content should have a reaction counter
        const reactionCounter = new ReactionCounter({
          content: {
            content_type: "BlogPost",
            content_id: publicBlogPost._id,
          },
          like_count: 0,
          dislike_count: 0,
        })
        await reactionCounter.save()

        res.redirect(303, `/blog-posts/${publicBlogPost._id}`)
      } else {
        res.end()
      }

      const privateBlogPost = new BlogPost(data)
      await privateBlogPost.save()
    }
  }),
]

// On blog post delete
// Public blog posts do not depend on private counterparts existing
// Comments should not be deleted - shared by public and private versions
exports.deletePrivateBlogPost = [
  asyncHandler(async (req, res, next) => {
    await BlogPost.findOneAndDelete({
      _id: req.documents.blogPostId._id,
    }).exec()
    res.end()
  }),
]

// Display blog post update form
exports.getBlogPostUpdateForm = [
  asyncHandler(async (req, res, next) => {
    const data = {
      title: "Update Blog Post",
      blogPost: req.documents.blogPostId,
    }

    res.render("pages/blogPostForm", { data })
  }),
]

// On blog post update
exports.updateBlogPost = [
  // Files processed after body middleware
  ...blogPostValidation.blogPost,

  asyncHandler(async (req, res, next) => {
    switch (req.body["pre-method"]) {
      case "discard":
        await backwardUpdate(req, res)
        break
      case "save":
        await forwardUpdate(req, res, ["title"])
        break
      case "publish":
        await forwardUpdate(req, res, null, true)
        break
      default: {
        const err = new Error(
          'Request body key "pre-method" must have value ' +
            '"discard", "save", or "publish".',
        )
        err.status = 400

        return next(err)
      }
    }

    async function backwardUpdate(req, res) {
      const blogPost = req.documents.blogPostId
      const privateFilter = {
        _id: blogPost._id,
      }

      if (blogPost.public_version) {
        const publicBlogPost = { ...blogPost.public_version }
        delete publicBlogPost._id

        publicBlogPost.last_modified_date = Date.now()

        await BlogPost.findOneAndUpdate(privateFilter, publicBlogPost)
      } else {
        await BlogPost.findOneAndDelete(privateFilter)
      }

      res.redirect(303, `/users/${req.user.username}/blog-posts`)
    }

    async function forwardUpdate(
      req,
      res,
      validationPaths = null,
      publishing = false,
    ) {
      const privateBlogPost = req.documents.blogPostId

      // Ensure user does not have to re-input image if one
      // already exists
      // Set all paths except for thumbnail
      if (!validationPaths && privateBlogPost.thumbnail) {
        validationPaths = ["title", "keywords", "content", "word-count"]
      }

      const data = await processBlogPostData(req, res, validationPaths)

      // data is undefined or an object
      if (!data) {
        return
      }

      const privateFilter = {
        _id: privateBlogPost._id,
      }
      const privateUpdate = { ...privateBlogPost, ...data }
      delete privateUpdate._id
      delete privateUpdate.public_version

      if (publishing) {
        privateUpdate.publish_date = Date.now()
        let publicBlogPost = privateBlogPost.public_version

        if (publicBlogPost) {
          const publicFilter = {
            _id: publicBlogPost._id,
          }
          const publicUpdate = privateUpdate

          // update public version
          await BlogPost.findOneAndUpdate(publicFilter, publicUpdate)
        } else {
          // create a public version
          const publicBlogPostData = { ...privateBlogPost, ...privateUpdate }
          delete publicBlogPostData._id

          publicBlogPost = new BlogPost(publicBlogPostData)
          await publicBlogPost.save()

          // create a reaction counter for public content
          const reactionCounter = new ReactionCounter({
            content: {
              content_type: "BlogPost",
              content_id: publicBlogPost._id,
            },
            like_count: 0,
            dislike_count: 0,
          })
          await reactionCounter.save()

          privateUpdate.public_version = publicBlogPost._id
        }

        res.redirect(303, `/blog-posts/${publicBlogPost._id}`)
      } else {
        res.end()
      }

      // update private version
      await BlogPost.findOneAndUpdate(privateFilter, privateUpdate)
    }
  }),
]

// If validationPaths = null, all paths are considered
async function processBlogPostData(req, res, validationPaths) {
  const errors = []

  if (req.fileTypeError) {
    errors.push({
      path: "thumbnail",
      msg: "File must be jpeg, jpg, png, webp, or gif.",
    })
  } else if (req.fileLimitError) {
    errors.push({
      path: "thumbnail",
      msg: req.fileLimitError.message,
    })
  } else if (
    !req.file &&
    (!validationPaths || validationPaths.includes("thumbnail"))
  ) {
    errors.push({
      path: "thumbnail",
      msg: "Thumbnail required.",
    })
  }

  const window = new JSDOM("").window
  const DOMPurify = createDOMPurify(window)

  const inputs = {
    title: DOMPurify.sanitize(req.body.title),
    keywords: DOMPurify.sanitize(req.body.keywords),
    content: DOMPurify.sanitize(req.body.content),
  }

  // remove weird tinymce phenomenon
  if (inputs.content === '<p><br data-mce-bogus="1"></p>') {
    inputs.content = ""
  }

  let nonFileErrors = validationResult(req).array()

  if (validationPaths) {
    nonFileErrors = nonFileErrors.filter((error) =>
      validationPaths.includes(error.path),
    )
  }

  errors.push(...nonFileErrors)

  if (errors.length) {
    res.status(400).json({ errors })
    return
  }

  const blogPostData = {
    title: inputs.title,
    author: req.user._id,
    content: inputs.content,
    last_modified_date: Date.now(),
  }

  if (inputs.keywords) {
    blogPostData.keywords = inputs.keywords.split(" ")
  }

  if (req.file) {
    blogPostData.thumbnail = {
      data: req.file.buffer,
      contentType: req.file.mimetype,
    }
  }

  return blogPostData
}
