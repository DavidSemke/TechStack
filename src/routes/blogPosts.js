const blogPostController = require("../controllers/blogPosts/blogPost")
const blogPostCommentController = require("../controllers/blogPosts/comment")
const express = require("express")
const router = express.Router()
const upload = require("./utils/upload")
const utils = require("./utils/router")
const BlogPost = require("../models/blogPost")
const Comment = require("../models/comment")

router.use((req, res, next) => {
  req.documents = {}
  next()
})

router.use(
  "/:blogPostId",
  utils.setObjectIdDocument(
    "params",
    "blogPostId",
    BlogPost,
    (blogPost) => {
      return blogPost.public_version || !blogPost.publish_date
    },
    ["author"],
  ),
)

// this route is used for querying blog posts from navbar searchbar
router.get("/", blogPostController.queryBlogPosts)

router.get("/:blogPostId", blogPostController.getBlogPost)

router.post(
  "/:blogPostId/comments",
  upload.none(),
  (req, res, next) => {
    if (req.body["reply-to"] === undefined) {
      return next()
    }

    utils.setObjectIdDocument("body", "reply-to", Comment)(req, res, next)
  },
  blogPostCommentController.postComment,
)

module.exports = router
