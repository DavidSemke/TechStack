const BlogPost = require("../../models/blogPost")
const User = require("../../models/user")
const asyncHandler = require("express-async-handler")
const query = require("../../utils/query")
const path = require("path")
const pug = require("pug")

exports.queryBlogPosts = asyncHandler(async (req, res, next) => {
  const keywordsParam = req.query.keywords

  if (!keywordsParam) {
    const err = new Error("Query parameter 'keywords' not found.")
    err.status = 400

    return next(err)
  }

  const keywords = keywordsParam.split(",")
  const queryConditions = []

  for (const keyword of keywords) {
    queryConditions.push({
      $or: [
        { title: { $regex: new RegExp(keyword, "i") } },
        { keywords: { $regex: new RegExp(`^${keyword}$`, "i") } },
      ],
    })
  }

  const finalQuery = {
    $and: queryConditions,
    public_version: { $exists: false },
    publish_date: { $exists: true },
  }

  const blogPosts = await BlogPost.find(finalQuery)
    .populate("author")
    .lean()
    .exec()

  const pugPath = path.join(
    process.cwd(),
    "src",
    "views",
    "components",
    "toolbar",
    "navbarDropdown.pug",
  )
  const template = pug.compileFile(pugPath)
  const renderedHTML = template({ blogPosts })

  res.json({ renderedHTML })
})

// Display blog post
exports.getBlogPost = asyncHandler(async (req, res, next) => {
  const blogPost = await query.completeBlogPost(
    req.documents.blogPostId,
    req.user,
  )

  if (req.user) {
    // Add blog post to current user's recently read list
    // Only do this if the blog post's author is not current user
    // If the blog post is already in the list, remove it and place
    // it at the front
    if (blogPost.author._id.toString() !== req.user._id.toString()) {
      let recentlyRead = req.user.blog_posts_recently_read
      recentlyRead = recentlyRead.filter(
        (recentRead) => recentRead._id.toString() !== blogPost._id.toString(),
      )
      const recentlyReadTotal = recentlyRead.unshift(blogPost._id)

      // enforce a maximum of 5 blog posts in recently read
      if (recentlyReadTotal > 5) {
        recentlyRead = recentlyRead.slice(0, 5)
      }

      await User.findOneAndUpdate(
        { _id: req.user._id },
        { blog_posts_recently_read: recentlyRead },
      )
    }
  }

  const data = {
    title: blogPost.title,
    blogPost,
    loginUser: req.user,
  }

  res.render("pages/blogPost", { data })
})
