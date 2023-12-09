const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BlogSchema = new Schema({
  title: { type: String, required: true },
  thumbnail: { data: Buffer, contentType: String },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  publish_date: { type: Date },
  keywords: { type: Array, required: true },
  content: { type: String, required: true },
  likes: { type: Number, required: true },
  dislikes: { type: Number, required: true }
});

// Virtual for blog URL
BlogSchema.virtual("url").get(function () {
  return `/blogs/${this._id}`;
});


module.exports = mongoose.model("Blog", BlogSchema)