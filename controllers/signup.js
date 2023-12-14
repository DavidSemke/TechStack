const User = require("../models/user");
const bcrypt = require('bcryptjs')
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const ents = require('../utils/htmlEntities')
const _ = require('lodash')

exports.getSignup = asyncHandler(async (req, res, next) => {
    const data = {
        title: "Sign Up"
    }
    const safeData = _.cloneDeep(data)

    res.render("pages/signupForm", { data, safeData })
})

exports.postSignup = [
    body("username")
        .trim()
        .isLength({ min: 6, max: 30 })
        .withMessage("Username must have 6 to 30 characters.")
        .custom(asyncHandler(async (value) => {
            const filter = { username: value }
            ents.encodeObject(filter)

            const userExists = await User
                .findOne(filter)
                .exec()

            if (userExists) {
                return Promise.reject()
            }
        }))
        .withMessage('Username already exists.'),
    body("password")
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
        const inputs = {
            username: req.body.username,
            password: req.body.password
        }
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            const data = {
                title: 'Sign Up',
                inputs: inputs,
                errors: errors.array(),
            }
            const safeData = _.cloneDeep(data)
            ents.encodeObject(safeData)
          
          res.render("pages/signupForm", { data, safeData })
        
          return;
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
                ents.encodeObject(
                    userData,
                    (key, value) => key === 'username'
                )
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