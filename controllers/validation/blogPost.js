const { body } = require("express-validator")
const message = require("./errorMessage")

const titleLength = { min: 20, max: 100 }
const keywordsLength = { max: 100 }
const minKeywords = 1
const maxKeywords = 10
const minWords = 500
const maxWords = 3000

const blogPost = [
  body("title")
    .isString()
    .withMessage("Title must be a string.")
    .trim()
    .isLength(titleLength)
    .withMessage((value) => {
      return message.invalidLength("title", value, titleLength)
    }),
  body("keywords")
    .isString()
    .withMessage("Keywords must be a string.")
    .trim()
    .isLength(keywordsLength)
    .withMessage((value) => {
      return message.invalidLength("keywords", value, keywordsLength)
    })
    .custom((value) => {
      const wordCount = value.split(" ").filter((x) => x).length
      return !(wordCount < minKeywords || wordCount > maxKeywords)
    })
    .withMessage(`Must have ${minKeywords} to ${maxKeywords} keywords.`),
  body("content").isString().withMessage("Content must be a string.").trim(),
  body("word-count")
    .custom((value) => {
      return typeof value === "string" && !isNaN(parseInt(value))
    })
    .withMessage("Word count must be a stringified number.")
    .custom((value) => {
      const wordCount = parseInt(value)
      return !(wordCount < minWords || wordCount > maxWords)
    })
    .withMessage(`Blog post must be ${minWords} to ${maxWords} words.`),
]

module.exports = {
  blogPost,
}
