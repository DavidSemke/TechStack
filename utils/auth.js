const bcrypt = require("bcryptjs")
const User = require("../models/user")
const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username }).lean().exec()

      if (!user) {
        return done(null, false, { message: "Incorrect username or password." })
      }

      const match = await bcrypt.compare(password, user.password)

      if (!match) {
        return done(null, false, { message: "Incorrect username or password." })
      }

      return done(null, user)
    } catch (err) {
      return done(err)
    }
  }),
)

passport.serializeUser((user, done) => {
  done(null, user._id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id)
      .populate("blog_posts_recently_read")
      .populate({
        path: "blog_posts_recently_read",
        populate: {
          path: "author",
        },
      })
      .lean()
      .exec()
    done(null, user)
  } catch (err) {
    done(err)
  }
})

module.exports = passport
