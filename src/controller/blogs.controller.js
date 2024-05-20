const { asyncErrorHandler } = require("../helper/async-error.helper");
const { uploadAndCreateImage } = require("../helper/upload.helpers");
const {
  createBlog,
  findAndUpdateBlog,
  createComment,
  associateCommentAndBlog,
  findCommentByIdAndUpdate,
  findBlogs,
  findAssociation,
  findAssociatedComments,
} = require("../service/blogs.service");
const { fileUpload } = require("../helper/upload.helpers");
const { nestComments } = require("../helper/blogs.helpers");

const { sendResponse } = require("../helper/local.helpers");

const addBlog = async (req, res) => {
  return asyncErrorHandler(async () => {
    const { _id: userId } = req.tokenData._doc;
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
    const { _id: userId } = req.tokenData._doc;
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
    const { _id: userId } = req.tokenData._doc;
    const { commentId, text } = req.body;

    const comment = await createComment({ userId, text, isReply: true });
    if (!comment) {
      return sendResponse(res, 400, false, "Unable to reply to comment.");
    }
    const addReplyToParent = await findCommentByIdAndUpdate(
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

module.exports = {
  addBlog,
  addComment,
  replyToComment,
  displayBlogs,
  displayAllComments,
};
