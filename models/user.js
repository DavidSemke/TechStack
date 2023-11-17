const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String, required: true, maxLength: 100 },
  password: { type: String, required: true },
  profile_pic: { data: Buffer, contentType: String }
});

// Virtual for user profile URL
UserSchema.virtual("url").get(function () {
  return `/users/${this.username}`;
});


module.exports = mongoose.model("User", UserSchema)
