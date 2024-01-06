const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReactionSchema = new Schema({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  content: { 
    contentType: {
        type: String,
        enum: ['Comment', 'BlogPost'],
        required: true
    },
    contentId: {
        type: Schema.Types.ObjectId,
        required: true
    }
  },
  reactionType: {
    type: String,
    enum: ['Like', 'Dislike'],
    required: true
  }
});


module.exports = mongoose.model("Reaction", ReactionSchema)