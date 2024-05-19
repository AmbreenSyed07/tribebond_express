const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: { type: String, required: true },
    replyIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    isReply: { type: Boolean, default: false }, // New field for tracking if the comment is a reply
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
