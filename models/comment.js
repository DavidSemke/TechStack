const { UserSchema } = require('user')
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  author: { type: UserSchema, required: true },
  blog: { type: Schema.Types.ObjectId, ref: 'Blog', required: true },
  publish_date: { type: Date, required: true },
  content: { type: String, maxLength: 300 },
  likes: { type: Number },
  dislikes: { type: Number },
  replies: { type: [Schema.Types.ObjectId], ref: 'Comment' }
});


module.exports = mongoose.model("Comment", CommentSchema)