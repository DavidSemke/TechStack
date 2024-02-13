const { body } = require("express-validator");
const User = require("../../models/user");
const asyncHandler = require("express-async-handler");


const user = [
    body("username")
        .isString()
        .withMessage(
            'Username must be a string.'
        )
        .trim()
        .isLength({ min: 6, max: 30 })
        .withMessage("Username must have 6 to 30 characters.")
        .custom((value) => {
            const usernameFormat = /^[-\dA-Za-z]*$/
            return usernameFormat.test(value)
        })
        .withMessage("Username must only contain alphanumeric characters and '-'.")
        .custom(asyncHandler(async (value) => {
            const userExists = await User
                .findOne({ username: value })
                .lean()
                .exec()

            if (userExists) {
                return Promise.reject()
            }
        }))
        .withMessage('Username already exists.'),
    body("password")
        .isString()
        .withMessage(
            'Password must be a string.'
        )
        .trim()
        .isLength({ min: 8 })
        .withMessage("Password must have at least 8 characters.")
        .custom((value) => {
            const containsNum = /\d/
            const containsSpecialChar = /[!@#$%^&*]/
            return (
                containsNum.test(value) 
                && containsSpecialChar.test(value)
            )
        })
        .withMessage(
            "Password must contain one of !@#$%^&* and a digit."
        ),
]


module.exports = {
    user
}