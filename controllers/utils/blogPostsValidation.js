const { body } = require("express-validator")

const comment = [
  body("content")
    .isString()
    .withMessage("Comment must be a string.")
    .trim()
    .isLength({ min: 1, max: 300 })
    .withMessage("Comment must be 1 to 300 characters."),
]

module.exports = {
  comment,
}
