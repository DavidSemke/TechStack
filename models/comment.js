const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  blogPost: { type: Schema.Types.ObjectId, ref: 'BlogPost', required: true },
  publish_date: { type: Date, required: true },
  content: { type: String, required: true },
  reply_to: { type: Schema.Types.ObjectId, ref: 'Comment' }
});


module.exports = mongoose.model("Comment", CommentSchema)