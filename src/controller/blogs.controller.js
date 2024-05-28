const { asyncErrorHandler } = require("../helper/async-error.helper");
const { uploadAndCreateImage } = require("../helper/upload.helpers");
const {
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
} = require("../service/blogs.service");
const { fileUpload } = require("../helper/upload.helpers");
const { nestComments } = require("../helper/blogs.helpers");

const { sendResponse } = require("../helper/local.helpers");

const addBlog = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData;
    const { statusText } = req.body;
    let backgroundImage = req && req.files && req.files.backgroundImage;
    let blogImages = req && req.files && req.files.blogImages;

    const info = {
      statusText,
      createdBy: userId,
    };

    const newBlog = await createBlog(info);
    if (!newBlog) {
      return sendResponse(res, 400, false, "Unable to add new blog.");
    } else {
      let bgImage;
      if (backgroundImage) {
        const newFile = await uploadAndCreateImage(
          backgroundImage,
          "blog/background-image",
          newBlog._id,
          res
        );
        bgImage = newFile;
      }

      if (bgImage) {
        let updatedBlog = await findAndUpdateBlog(
          { _id: newBlog._id },
          {
            backgroundImage: bgImage,
          }
        );
        if (!updatedBlog) {
          return sendResponse(
            res,
            400,
            false,
            "Unable to save background image."
          );
        }
      }
      if (blogImages) {
        let imgArray = [];
        if (!blogImages[0]) {
          let fileName = await uploadAndCreateImage(
            blogImages,
            "blog/blog-post-image",
            newBlog._id,
            res
          );
          imgArray.push(fileName);
        } else {
          for (let img of blogImages) {
            let fileName = await uploadAndCreateImage(img, newBlog._id, res);
            imgArray.push(fileName);
          }
        }
        let updatedBlog = await findAndUpdateBlog(
          { _id: newBlog._id },
          {
            blogImage: imgArray,
          }
        );
        if (!updatedBlog) {
          return sendResponse(res, 400, false, "Unable to save images.");
        }
      }

      return sendResponse(
        res,
        200,
        true,
        "Successfully added new blog post.",
        newBlog
      );
    }
  }, res);
};

const addComment = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData;
    const { blogId, text } = req.body;

    const comment = await createComment({ userId, text });
    if (!comment) {
      return sendResponse(res, 400, false, "Unable to add comment.");
    }
    let association = await associateCommentAndBlog(blogId, comment._id);
    if (!association) {
      return sendResponse(res, 400, false, "Unable to add comment.");
    }
    return sendResponse(
      res,
      200,
      true,
      "Successfully added your comment.",
      comment
    );
  }, res);
};

const replyToComment = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData;
    const { commentId, text } = req.body;

    const comment = await createComment({ userId, text, isReply: true });
    if (!comment) {
      return sendResponse(res, 400, false, "Unable to reply to comment.");
    }
    const addReplyToParent = await addReplyToComment(
      res,
      commentId,
      comment._id,
      res
    );
    if (!addReplyToParent) {
      return sendResponse(res, 400, false, "Unable to reply to comment.");
    }
    return sendResponse(res, 200, true, "Successfully replied to comment.");
  }, res);
};

const displayBlogs = async (req, res) => {
  return asyncErrorHandler(async () => {
    const blogs = await findBlogs();
    if (!blogs) {
      return sendResponse(res, 400, false, "No blogs have been posted yet.");
    }

    const blogsWithComments = await Promise.all(
      blogs.map(async (blog) => {
        const association = await findAssociation(blog._id);

        if (association) {
          // Get the latest 2 comments (first 2 in the commentIds array)
          const latestCommentIds = association?.commentIds?.slice(0, 2);
          const comments = await findAssociatedComments(latestCommentIds);
          // what to do if comments is false????
          if (comments) {
            const nestedComments = await nestComments(comments);
            return { ...blog.toObject(), comments: nestedComments };
          }
        } else {
          return { ...blog.toObject(), comments: [] };
        }
      })
    );

    return sendResponse(
      res,
      200,
      true,
      "Successfully fetched blog posts.",
      blogsWithComments
    );
  }, res);
};

const displayAllComments = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { blogId } = req.body;
    if (!blogId) {
      return sendResponse(
        res,
        400,
        false,
        "Please select a blog to view comments."
      );
    }
    const association = await findAssociation(blogId);

    if (association) {
      // Get the latest 2 comments (first 2 in the commentIds array)
      const comments = await findAssociatedComments(association?.commentIds);
      // what to do if comments is false????
      if (comments) {
        const nestedComments = await nestComments(comments);
        return sendResponse(
          res,
          200,
          true,
          "Successfully fetched comments.",
          nestedComments
        );
      }
    } else {
      return sendResponse(
        res,
        400,
        false,
        "No comments have been posted on this blog."
      );
    }
  }, res);
};

const deleteBlog = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { id } = req.params;
    const { _id } = req.tokenData;

    const checkBlog = await findBlogById(id);
    if (!checkBlog) {
      return sendResponse(res, 404, false, "Blog not found.");
    }

    // Check if the blog's createdBy is equal to the user's id
    if (checkBlog.createdBy.toString() !== _id.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "You are not eligible to delete this post."
      );
    }

    const findInfo = { _id: id, createdBy: _id };
    const setInfo = { status: 0, updatedBy: _id };

    const blog = await findAndUpdateBlog(findInfo, setInfo);
    if (!blog) {
      return sendResponse(res, 400, false, "Unable to delete blog.");
    }

    return sendResponse(res, 200, true, "Successfully deleted blog.");
  }, res);
};

const deleteComment = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { comment_id: commentId, blog_id: blogId } = req.params;
    const { _id: userId } = req.tokenData;
    const existingBlog = await findBlogById(blogId);
    if (!existingBlog) {
      return sendResponse(res, 404, false, "Blog not found.");
    }

    // Find the comment by id
    const existingComment = await findCommentById(commentId);
    if (!existingComment) {
      return sendResponse(res, 404, false, "Comment not found.");
    }

    if (
      existingBlog.createdBy.toString() !== userId.toString() &&
      existingComment.userId.toString() !== userId.toString()
    ) {
      return sendResponse(
        res,
        403,
        false,
        "You are not eligible to delete this comment."
      );
    }

    const findInfo = { _id: commentId };
    const setInfo = { status: false, updatedBy: userId };

    const comment = await findAndUpdateComment(findInfo, setInfo);
    if (!comment) {
      return sendResponse(res, 400, false, "Unable to delete comment.");
    }

    return sendResponse(res, 200, true, "Successfully deleted comment.");
  }, res);
};

module.exports = {
  addBlog,
  addComment,
  replyToComment,
  displayBlogs,
  displayAllComments,
  deleteBlog,
  deleteComment,
};
