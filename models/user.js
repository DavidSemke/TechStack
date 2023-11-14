const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String, required: true, maxLength: 100 },
  password: { type: String, required: true },
  profile_pic: { data: Buffer, contentType: String }
});


exports.UserSchema = UserSchema
exports.User = mongoose.model("User", UserSchema)
