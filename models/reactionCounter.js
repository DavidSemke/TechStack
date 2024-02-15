const mongoose = require("mongoose")
const Schema = mongoose.Schema

const ReactionCounterSchema = new Schema({
  content: {
    content_type: {
      type: String,
      enum: ["Comment", "BlogPost"],
      required: true,
    },
    content_id: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  like_count: {
    type: Number,
    required: true,
  },
  dislike_count: {
    type: Number,
    required: true,
  },
})

module.exports = mongoose.model("ReactionCounter", ReactionCounterSchema)
