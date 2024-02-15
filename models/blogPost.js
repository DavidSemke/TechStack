const mongoose = require("mongoose")
const Schema = mongoose.Schema

const BlogPostSchema = new Schema({
  title: { type: String, required: true },
  thumbnail: { data: Buffer, contentType: String },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  publish_date: { type: Date },
  last_modified_date: { type: Date, required: true },
  keywords: { type: Array },
  content: { type: String },
  public_version: { type: Schema.Types.ObjectId, ref: "BlogPost" },
})

module.exports = mongoose.model("BlogPost", BlogPostSchema)
