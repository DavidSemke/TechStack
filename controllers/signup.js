const User = require("../models/user");
const bcrypt = require('bcryptjs')
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.getSignup = asyncHandler(async (req, res, next) => {
    res.render(
        "pages/signupForm", 
        { 
            title: "Sign Up"
        }
    )
})

exports.postSignup = [
    body("username")
        .trim()
        .isLength({ min: 6, max: 30 })
        .withMessage("Username must have 6 to 30 characters.")
        .escape()
        .custom(asyncHandler(async (value) => {
            const userExists = await User
                .findOne({ username: value })
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
        )
        .escape(),
    
    asyncHandler(async (req, res, next) => {
        const inputs = {
            username: req.body.username,
            password: req.body.password
        }
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
          // Render errors
          res.render("pages/signupForm", {
            title: 'Sign Up',
            inputs: inputs,
            errors: errors.array(),
          });
        
          return;
        }

        bcrypt.hash(req.body.password, 10, async (err, hash) => {
            if (err) {
              return;
            }
        
            try {
              const user = new User({
                username: req.body.username,
                password: hash
              });
        
              await user.save();
              
              res.redirect("/");
            } 
            catch(err) {
              return;
            };
        });
    }),
]