const Reaction = require("../../models/reaction")
const ReactionCounter = require("../../models/reactionCounter")
const asyncHandler = require("express-async-handler")
const { validationResult } = require("express-validator")
const reactionValidation = require("../../validation/reaction")

exports.postReaction = [
  ...reactionValidation.reaction,

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req).array()

    if (errors.length) {
      const err = errors[0]
      err.status = 400

      return next(err)
    }

    const contentType = req.body["content-type"]
    const reactionType = req.body["reaction-type"]
    const contentId = req.documents["content-id"]._id

    const promises = []

    const reaction = new Reaction({
      user: req.user._id,
      content: {
        content_type: contentType,
        content_id: contentId,
      },
      reaction_type: reactionType,
    })
    promises.push(reaction.save())

    const countAttribute = `${reactionType.toLowerCase()}_count`
    promises.push(
      ReactionCounter.findOneAndUpdate(
        {
          content: {
            content_type: contentType,
            content_id: contentId,
          },
        },
        { $inc: { [countAttribute]: 1 } },
      ),
    )

    await Promise.all(promises)

    res.json({ reactionId: reaction._id })
  }),
]

exports.updateReaction = [
  ...reactionValidation.reaction,

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req).array()

    if (errors.length) {
      const err = errors[0]
      err.status = 400

      return next(err)
    }

    const contentType = req.body["content-type"]
    const reactionType = req.body["reaction-type"]
    const contentId = req.documents["content-id"]._id
    const reactionId = req.documents.reactionId._id

    const promises = [
      Reaction.findOneAndUpdate(
        {
          _id: reactionId,
        },
        {
          reaction_type: reactionType,
        },
      ).exec(),
    ]

    let primaryCountAttribute = null
    let secondaryCountAttribute = null

    if (reactionType === "Like") {
      primaryCountAttribute = "like_count"
      secondaryCountAttribute = "dislike_count"
    } else if (reactionType === "Dislike") {
      primaryCountAttribute = "dislike_count"
      secondaryCountAttribute = "like_count"
    }

    promises.push(
      ReactionCounter.findOneAndUpdate(
        {
          content: {
            content_type: contentType,
            content_id: contentId,
          },
        },
        {
          $inc: {
            [primaryCountAttribute]: 1,
            [secondaryCountAttribute]: -1,
          },
        },
      ).exec(),
    )

    await Promise.all(promises)

    res.json({ reactionId })
  }),
]

exports.deleteReaction = [
  ...reactionValidation.reaction,

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req).array()

    if (errors.length) {
      const err = errors[0]
      err.status = 400

      return next(err)
    }

    const contentType = req.body["content-type"]
    const reactionType = req.body["reaction-type"]
    const contentId = req.documents["content-id"]._id
    const reactionId = req.documents.reactionId._id

    const promises = [
      Reaction.findOneAndDelete({
        _id: reactionId,
      }).exec(),
    ]

    const countAttribute = `${reactionType.toLowerCase()}_count`
    promises.push(
      ReactionCounter.findOneAndUpdate(
        {
          content: {
            content_type: contentType,
            content_id: contentId,
          },
        },
        { $inc: { [countAttribute]: -1 } },
      ),
    )

    await Promise.all(promises)

    res.json({ reactionId: null })
  }),
]
