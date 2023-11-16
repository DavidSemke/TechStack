const User = require("../models/user");
const express = require("express")
const router = express.Router()


router.get("/", function (req, res, next) {
  res.render("pages/signupForm", { title: "Sign Up" })
})

router.post("/", async function (req, res, next) {
    try {
        const user = new User({
          username: req.body.username,
          password: req.body.password
        });

        await user.save();
        
        res.redirect("/");
    } 
    catch(err) {
        return next(err);
    };
})

module.exports = router