const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");


// Display user profile
// Usernames are unique, and so are used as ids
exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User.find({username: req.params.username})

    if (user === null) {
        const err = new Error("User not found");
        err.status = 404;
        
        return next(err);
    }

    res.render(
        "pages/userProfile", 
        { 
            title: `${req.user.username}'s Profile`
        }
    );
});