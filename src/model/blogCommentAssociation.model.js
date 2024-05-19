const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const blogCommentAssociationSchema = new Schema(
  {
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
    },
    commentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

const BlogCommentAssociation = mongoose.model(
  "BlogCommentAssociation",
  blogCommentAssociationSchema
);

module.exports = BlogCommentAssociation;
