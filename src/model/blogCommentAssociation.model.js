const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const likeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: Boolean, default: true },
});

const blogCommentAssociationSchema = new Schema(
  {
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
    },
    commentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    likeIds: [likeSchema],
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const BlogCommentAssociation = mongoose.model(
  "BlogCommentAssociation",
  blogCommentAssociationSchema
);

module.exports = BlogCommentAssociation;
