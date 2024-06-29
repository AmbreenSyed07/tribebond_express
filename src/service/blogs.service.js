const { asyncHandler } = require("../helper/async-error.helper");
const Blog = require("../model/blog.model");
const Comment = require("../model/comment.model");
const Like = require("../model/likes.model");

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
      .sort({ createdAt: -1 })
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

const findAndUpdateComment = async (findInfo, setInfo) => {
  return asyncHandler(async () => {
    const comment = await Comment.findOneAndUpdate(
      findInfo, // Match both ID and Type
      {
        $set: setInfo,
      },
      { new: true, runValidators: true } // Options to return the updated document and run schema validators
    );
    return comment ? comment : false;
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

const addReplyToComment = async (res, commentId, replyId) => {
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
      status: true,
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

const findBlogById = async (id) => {
  return asyncHandler(async () => {
    const blog = await Blog.findOne({ _id: id, status: 1 });
    return blog ? blog : false;
  });
};

const findCommentById = async (id) => {
  return asyncHandler(async () => {
    const comment = await Comment.findById(id);
    return comment ? comment : false;
  });
};

const createLike = async (info) => {
  return asyncHandler(async () => {
    const like = new Like(info);

    const savedLike = await like.save();
    return savedLike instanceof Like ? savedLike.toJSON() : false;
  });
};

const associateLike = async ({ blogId, userId, likeId }) => {
  return asyncHandler(async () => {
    let blogAssociation = await BlogCommentAssociation.findOne({
      blogId,
    });
    if (!blogAssociation) {
      blogAssociation = new BlogCommentAssociation({
        blogId,
        commentIds: [],
        likeIds: [{ userId, status: true }],
      });
      await blogAssociation.save();
      return "liked";
    } else {
      const existingLikeIndex = blogAssociation.likeIds.findIndex(
        (like) => like.userId.toString() === userId.toString()
      );

      if (existingLikeIndex === -1) {
        // Add a new like
        blogAssociation.likeIds.push({ userId, status: true });
        await blogAssociation.save();
        // return sendResponse(res, 200, true, "Blog liked successfully.");
      } else {
        // Toggle like/unlike
        blogAssociation.likeIds[existingLikeIndex].status =
          !blogAssociation.likeIds[existingLikeIndex].status;
        await blogAssociation.save();
        return blogAssociation.likeIds[existingLikeIndex].status
          ? "liked"
          : "unliked";
      }
    }
  });
};

module.exports = {
  createBlog,
  findAndUpdateBlog,
  createComment,
  associateCommentAndBlog,
  addReplyToComment,
  findBlogs,
  findAssociation,
  findAssociatedComments,
  findAndUpdateComment,
  findBlogById,
  findCommentById,
  createLike,
  associateLike,
};
