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
        .custom(asyncHandler(async (value, { req }) => {
            const user = await User
                .findOne({ username: value })
                .lean()
                .exec()

            if (user && req.user.username !== value) {
                return Promise.reject()
            }
        }))
        .withMessage('Username already exists.'),
    body("bio")
        .isString()
        .withMessage(
            'Bio must be a string.'
        )
        .trim()
        .isLength({ min: 0, max: 300 })
        .withMessage("Bio cannot have more than 300 characters."),
    body("keywords")
        .isString()
        .withMessage(
            'Keywords must be a string.'
        )
        .trim()
        .custom((value) => {
            const wordCount = value
                .split(' ')
                .filter(x => x)
                .length
            
            return wordCount <= 10
        })
        .withMessage('Cannot have more than 10 keywords.')
]

const reaction = [
    body("content-type")
        .custom((value) => {
            return ['BlogPost', 'Comment'].includes(value)
        })
        .withMessage(
            "Content type must be in ['BlogPost', 'Comment']"
        )
        .custom((value, { req }) => {
            const content = req.documents['content-id']

            // blog posts, but not comments, have a title
            if (
                (value === 'BlogPost' && !content.title)
                || (value === 'Comment' && content.title)
            ) {
                return false
            }

            return true
        })
        .withMessage(
            'Content given by content id does not match content type'
        ),
    body("reaction-type")
        .custom((value) => {
            return ['Like', 'Dislike'].includes(value)
        })
        .withMessage(
            "Reaction type must be in ['Like', 'Dislike']"
        )
]

const blogPost = [
    body("title")
        .isString()
        .withMessage(
            'Title must be a string.'
        )
        .trim()
        .isLength({ min: 60, max: 100 })
        .withMessage("Title must have 60 to 100 characters."),
    body("keywords")
        .isString()
        .withMessage(
            'Keywords must be a string.'
        )
        .trim()
        .custom((value) => {
            const wordCount = value
                .split(' ')
                .filter(x => x)
                .length
            
            return !(wordCount < 1 || wordCount > 10)
        })
        .withMessage('Must have 1 to 10 keywords.'),
    body("content")
        .isString()
        .withMessage(
            'Content must be a string.'
        )
        .trim(),
    body("word-count")
        .custom((value) => {
            return typeof value === 'string' && !isNaN(parseInt(value))
        })
        .withMessage(
            'Word count must be a stringified number.'
        )
        .custom((value) => {
            let wordCount = parseInt(value)
            
            return !(wordCount < 500 || wordCount > 3000)
        })
        .withMessage("Blog post must be 500 to 3000 words."),
]


module.exports = {
    user,
    reaction,
    blogPost
}