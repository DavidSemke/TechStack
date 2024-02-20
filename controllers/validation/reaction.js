const { body } = require("express-validator")


const contentTypes = ["BlogPost", "Comment"]
const reactionTypes = ["Like", "Dislike"]

const reaction = [
  body("content-type")
    .custom((value) => {
      return contentTypes.includes(value)
    })
    .withMessage(
        `Content type must be in [${contentTypes}]`
    )
    .custom((value, { req }) => {
      const content = req.documents["content-id"]

      // blog posts, but not comments, have a title
      if (
        (value === "BlogPost" && !content.title) ||
        (value === "Comment" && content.title)
      ) {
        return false
      }

      return true
    })
    .withMessage("Content given by content id does not match content type"),
  body("reaction-type")
    .custom((value) => {
      return reactionTypes.includes(value)
    })
    .withMessage(`Reaction type must be in [${reactionTypes}]`),
]


module.exports = {
  reaction
}
