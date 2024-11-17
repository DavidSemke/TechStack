const Comment = require("../../models/comment")
const ReactionCounter = require("../../models/reactionCounter")
const asyncHandler = require("express-async-handler")
const { validationResult } = require("express-validator")
const dateFormat = require("../../utils/dateFormat")
const createDOMPurify = require("dompurify")
const { JSDOM } = require("jsdom")
const commentVal = require("../../validation/comment")
const path = require("path")
const pug = require("pug")

exports.postComment = [
  ...commentVal.comment,

  asyncHandler(async (req, res, next) => {
    const blogPost = req.documents.blogPostId
    const replyTo = req.documents["reply-to"]
    const content = req.body.content
    const errors = validationResult(req).array()

    if (errors.length) {
      res.status(400).json({ errors })
      return
    }

    const window = new JSDOM("").window
    const DOMPurify = createDOMPurify(window)
    const pureContent = DOMPurify.sanitize(content)

    const commentData = {
      blog_post: blogPost._id,
      publish_date: Date.now(),
      content: pureContent,
    }

    commentData.author = req.user ? req.user._id : undefined

    if (replyTo) {
      if (replyTo.reply_to) {
        const err = new Error("Cannot reply to a reply")
        err.status = 400

        return next(err)
      }

      commentData.reply_to = replyTo._id
    }

    let comment = new Comment(commentData)
    await comment.save()

    comment = await Comment.findById(comment._id)
      .populate("author")
      .lean()
      .exec()
    comment.publish_date = dateFormat.formatDate(comment.publish_date)
    comment.likes = 0
    comment.dislikes = 0
    comment.replies = []

    const reactionCounter = new ReactionCounter({
      content: {
        content_type: "Comment",
        content_id: comment._id,
      },
      like_count: 0,
      dislike_count: 0,
    })
    await reactionCounter.save()

    const mixinPath = path.join(
      "src",
      "views",
      "components",
      "card",
      "commentCard.pug",
    )
    const pugString = `include ${mixinPath}\n+commentCard(comment, isReply)`
    const template = pug.compile(pugString, {
      filename: "commentCardTemplate",
      basedir: process.cwd(),
    })
    const isReply = Boolean(replyTo)
    const renderedHTML = template({
      comment,
      isReply,
    })

    res.json({ renderedHTML, commentData: comment })
  }),
]
