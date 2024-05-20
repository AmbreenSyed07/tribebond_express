const { asyncHandler } = require("../helper/async-error.helper");
const Blog = require("../model/blog.model");
const Comment = require("../model/comment.model");
const BlogCommentAssociation = require("../model/blogCommentAssociation.model");
const { base_url, sendResponse } = require("../helper/local.helpers");

const createBlog = async (info) => {
  return asyncHandler(async () => {
    const blog = new Blog(info);

    const savedBlog = await blog.save();
    return savedBlog instanceof Blog ? savedBlog.toJSON() : false;
  });
};

const findBlogs = async () => {
  return asyncHandler(async () => {
    const blogs = await Blog.find({ status: true })
      .populate("createdBy", "firstName lastName profilePicture")
      .exec();

    for (let blog of blogs) {
      if (
        blog.createdBy &&
        blog.createdBy.profilePicture &&
        !blog.createdBy.profilePicture.startsWith(base_url)
      ) {
        blog.createdBy.profilePicture = `${base_url}public/data/profile/${blog.createdBy._id}/${blog.createdBy.profilePicture}`;
      }

      if (blog.backgroundImage && !blog.backgroundImage.startsWith(base_url)) {
        blog.backgroundImage = `${base_url}public/data/blog/background-image/${blog._id}/${blog.backgroundImage}`;
      }

      if (blog.blogImage && blog.blogImage.length > 0) {
        for (let i = 0; i < blog.blogImage.length; i++) {
          let image = blog.blogImage[i];
          if (!image.startsWith(base_url)) {
            blog.blogImage[
              i
            ] = `${base_url}public/data/blog/blog-post-image/${blog._id}/${image}`;
          }
        }
      }
    }

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

const findCommentByIdAndUpdate = async (res, commentId, replyId) => {
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
    })
      .populate({
        path: "replyIds",
        select: "_id text userId isReply status",
        populate: {
          path: "userId",
          select: "_id firstName lastName profilePicture",
        },
      })
      .populate("userId", "_id firstName lastName profilePicture");
    // .populate("replyIds", "_id text userId isReply status");
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
