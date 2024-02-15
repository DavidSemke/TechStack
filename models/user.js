const mongoose = require("mongoose")
const Schema = mongoose.Schema

const UserSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  profile_pic: {
    data: Buffer,
    contentType: String,
  },
  bio: { type: String },
  keywords: { type: Array },
  blog_posts_recently_read: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "BlogPost",
      },
    ],
  },
})

module.exports = mongoose.model("User", UserSchema)
