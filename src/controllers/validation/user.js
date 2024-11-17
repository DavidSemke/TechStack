const { body } = require("express-validator")
const User = require("../../models/user")
const asyncHandler = require("express-async-handler")
const message = require("./errorMessage")

const usernameLength = { min: 6, max: 30 }
const passwordLength = { min: 8 }
const passwordSpecialChars = "!@#$%^&*"
const bioLength = { max: 300 }
const keywordsLength = { max: 100 }
const maxKeywords = 10

const userSignup = [
  validateUsername(),
  body("password")
    .isString()
    .withMessage("Password must be a string.")
    .trim()
    .isLength(passwordLength)
    .withMessage((value) => {
      return message.invalidLength("password", value, passwordLength)
    })
    .custom((value) => {
      const containsNum = /\d/
      const containsSpecialChar = new RegExp(`[${passwordSpecialChars}]`)
      return containsNum.test(value) && containsSpecialChar.test(value)
    })
    .withMessage(
      `Password must contain one of ${passwordSpecialChars} and a digit.`,
    ),
]

const userUpdate = [
  validateUsername(),
  body("bio")
    .isString()
    .withMessage("Bio must be a string.")
    .trim()
    .isLength(bioLength)
    .withMessage((value) => {
      return message.invalidLength("bio", value, bioLength)
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
      return wordCount <= maxKeywords
    })
    .withMessage(`Cannot have more than ${maxKeywords} keywords.`),
]

function validateUsername() {
  return body("username")
    .isString()
    .withMessage("Username must be a string.")
    .trim()
    .isLength(usernameLength)
    .withMessage((value) => {
      return message.invalidLength("username", value, usernameLength)
    })
    .custom((value) => {
      const usernameFormat = /^[-\dA-Za-z]*$/
      return usernameFormat.test(value)
    })
    .withMessage("Username must only contain alphanumeric characters and '-'.")
    .custom(
      asyncHandler(async (value, { req }) => {
        const userExists = await User.findOne({ username: value }).lean().exec()
        const loginUser = req.user

        if (userExists && (!loginUser || loginUser.username !== value)) {
          return Promise.reject(new Error("Username already exists."))
        }
      }),
    )
    .withMessage("Username already exists.")
}

module.exports = {
  userSignup,
  userUpdate,
}
