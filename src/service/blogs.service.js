const { asyncHandler } = require("../helper/async-error.helper");
const Blog = require("../model/blog.model");
const Comment = require("../model/comment.model");
const BlogCommentAssociation = require("../model/blogCommentAssociation.model");

const createBlog = async (info) => {
  return asyncHandler(async () => {
    const blog = new Blog(info);

    const savedBlog = await blog.save();
    return savedBlog instanceof Blog ? savedBlog.toJSON() : false;
  });
};

const findBlogs = async () => {
  return asyncHandler(async () => {
    const blogs = await Blog.find({ status: true });
    return blogs ? blogs : false;
  });
};

const findAndUpdateBlog = async (findInfo, setInfo) => {
  return asyncHandler(async () => {
    const blog = await Blog.findOneAndUpdate(
      findInfo, // Match both ID and Type
      {
        $set: setInfo,
      },
      { new: true, runValidators: true } // Options to return the updated document and run schema validators
    );
    return blog ? blog : false;
  });
};

const createComment = async (info) => {
  return asyncHandler(async () => {
    const comment = new Comment(info);

    const savedComment = await comment.save();
    return savedComment instanceof Comment ? savedComment.toJSON() : false;
  });
};

const associateCommentAndBlog = async (blogId, commentId) => {
  return asyncHandler(async () => {
    let blogCommentAssociation = await BlogCommentAssociation.findOne({
      blogId,
    });
    if (!blogCommentAssociation) {
      blogCommentAssociation = new BlogCommentAssociation({
        blogId,
        commentIds: [commentId],
      });
    } else {
      blogCommentAssociation.commentIds.unshift(commentId);
    }

    let associationCreated = await blogCommentAssociation.save();
    return associationCreated instanceof BlogCommentAssociation
      ? associationCreated.toJSON()
      : false;
  });
};

const findCommentByIdAndUpdate = async (commentId, replyId) => {
  return asyncHandler(async () => {
    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      return sendResponse(res, 400, false, "Could not find comment.");
    }
    parentComment?.replyIds?.unshift(replyId);
    const savedReply = await parentComment.save();
    return savedReply instanceof Comment ? savedReply.toJSON() : false;
  });
};

const findAssociation = async (id) => {
  return asyncHandler(async () => {
    let association = await BlogCommentAssociation.findOne({
      blogId: id,
    });
    return association ? association : false;
  });
};

const findAssociatedComments = async (latestCommentIds) => {
  return asyncHandler(async () => {
    let associatedComments = await Comment.find({
      _id: { $in: latestCommentIds },
      status: true,
    }).populate("replyIds", "_id text userId isReply status");
    return associatedComments ? associatedComments : false;
  });
};

module.exports = {
  createBlog,
  findAndUpdateBlog,
  createComment,
  associateCommentAndBlog,
  findCommentByIdAndUpdate,
  findBlogs,
  findAssociation,
  findAssociatedComments,
};
