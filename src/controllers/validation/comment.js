const { body } = require("express-validator")
const message = require("./errorMessage")

const contentLength = { min: 1, max: 300 }

const comment = [
  body("content")
    .isString()
    .withMessage("Content must be a string.")
    .trim()
    .isLength(contentLength)
    .withMessage((value) => {
      return message.invalidLength("content", value, contentLength)
    }),
]

module.exports = {
  comment,
}
