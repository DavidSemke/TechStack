const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  profile_pic: { data: Buffer, contentType: String },
  bio: { type: String },
  keywords: { type: Array },
  blogs_recently_read: { 
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Blog',
      }
    ], 
  },
  blogs_written: { 
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Blog',
      }
    ], 
  }
});

// Virtual for user profile URL
UserSchema.virtual("url").get(function () {
  return `/users/${this.username}`;
});


module.exports = mongoose.model("User", UserSchema)