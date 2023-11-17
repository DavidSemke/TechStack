const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  author: { 
    type: new Schema({
      name: { type: String, required: true },
      profile_pic: { data: Buffer, contentType: String }
    }), 
    required: true 
  },
  blog: { type: Schema.Types.ObjectId, ref: 'Blog', required: true },
  publish_date: { type: Date, required: true },
  content: { type: String, maxLength: 300 },
  likes: { type: Number },
  dislikes: { type: Number },
  reply_to: { type: Schema.Types.ObjectId, ref: 'Comment' }
});


module.exports = mongoose.model("Comment", CommentSchema)