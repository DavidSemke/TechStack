const mongoose = require("mongoose")
const Schema = mongoose.Schema

const ReactionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
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
  reaction_type: {
    type: String,
    enum: ["Like", "Dislike"],
    required: true,
  },
})

module.exports = mongoose.model("Reaction", ReactionSchema)
