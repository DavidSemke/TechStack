const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BlogPostSchema = new Schema({
  title: { type: String, required: true },
  thumbnail: { data: Buffer, contentType: String },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  publish_date: { type: Date },
  last_modified_date: { type: Date, required: true },
  keywords: { type: Array, required: true },
  content: { type: String, required: true },
  likes: { type: Number, required: true },
  dislikes: { type: Number, required: true }
});


module.exports = mongoose.model("BlogPost", BlogPostSchema)