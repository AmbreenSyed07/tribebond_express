let Comment = require("../model/comment.model");
const { base_url } = require("./local.helpers");

const updateProfilePictureUrl = (comments) => {
  comments.forEach((comment) => {
    // Update the profile picture for the userId in the main comment
    if (
      comment.userId &&
      comment.userId.profilePicture &&
      !comment.userId.profilePicture.startsWith(base_url)
    ) {
      comment.userId.profilePicture = `${base_url}public/data/profile/${comment.userId._id}/${comment.userId.profilePicture}`;
    }

    // Update the profile pictures for userId in the replies
    if (comment.replyIds && comment.replyIds.length > 0) {
      comment.replyIds.forEach((reply) => {
        if (
          reply.userId &&
          reply.userId.profilePicture &&
          !reply.userId.profilePicture.startsWith(base_url)
        ) {
          reply.userId.profilePicture = `${base_url}public/data/profile/${reply.userId._id}/${reply.userId.profilePicture}`;
        }
      });
    }
  });
};

const nestComments = async (commentsIn) => {
  const commentMap = {};
  let comments = [...commentsIn];

  for (let comment of comments) {
    comment.replies = [];
    commentMap[comment._id] = comment;
    if (comment.replyIds && comment.replyIds.length > 0) {
      let replies = await Comment.find({
        _id: { $in: comment.replyIds },
        status: true,
        isReply: true,
      });
      if (replies && replies.length > 0) {
        await comment.replies.push(replies);
      }
    }
  }

  updateProfilePictureUrl(comments);
  return comments.filter((comment) => !comment.isReply);
};

module.exports = { nestComments };
