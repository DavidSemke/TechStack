const User = require("../models/user");
const bcrypt = require('bcryptjs')
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const createDOMPurify = require('dompurify')
const { JSDOM } = require('jsdom')


exports.getSignup = asyncHandler(async (req, res, next) => {
    const data = {
        title: "Sign Up",
        inputs: {},
        errors: []
    }

    res.render("pages/signupForm", { data })
})

exports.postSignup = [
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
    
    asyncHandler(async (req, res, next) => {
        const window = new JSDOM('').window;
        const DOMPurify = createDOMPurify(window);
        const inputs = {
            username: DOMPurify.sanitize(req.body.username),
            password: DOMPurify.sanitize(req.body.password)
        }

        const errors = validationResult(req).array();
        
        if (errors.length) {
            const data = {
                title: "Sign Up",
                inputs,
                errors
            }
        
            res.status(400).render("pages/signupForm", { data })
            return 
        }

        bcrypt.hash(req.body.password, 10, async (err, hash) => {
            if (err) {
              return next(err);
            }
        
            try {
                const userData = {
                    username: req.body.username,
                    password: hash
                }
                const user = new User(userData);
                await user.save();

                res.redirect("/");
            } 
            catch(err) {
                return next(err);
            };
        });
    }),
]