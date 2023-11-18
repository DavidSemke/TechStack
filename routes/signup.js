const bcrypt = require('bcryptjs')
const User = require("../models/user");
const express = require("express")
const router = express.Router()


router.get("/", function (req, res, next) {
  res.render("pages/signupForm", { title: "Sign Up" })
})

router.post("/", async function (req, res, next) {
  bcrypt.hash(req.body.password, 10, async (err, hash) => {
    if (err) {
      return next(err);
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
      return next(err);
    };
  });
})

module.exports = router