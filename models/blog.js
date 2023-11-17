const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BlogSchema = new Schema({
  title: { type: String, required: true, maxLength: 100 },
  author: { 
    type: new Schema({
      name: { type: String, required: true },
      profile_pic: { data: Buffer, contentType: String }
    }), 
    required: true 
  },
  publish_date: { type: Date },
  keywords: { type: Array },
  content: { type: Array },
  likes: { type: Number, required: true },
  dislikes: { type: Number, required: true }
});

// Virtual for blog URL
BlogSchema.virtual("url").get(function () {
  return `/blogs/${this._id}`;
});


module.exports = mongoose.model("Blog", BlogSchema)