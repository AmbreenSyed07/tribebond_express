let Comment = require("../model/comment.model");

// const nestComments = async (comments) => {
//   const commentMap = {};
//   const replyPromises = [];
//   comments &&
//     comments.forEach((comment) => {
//       comment.replies = [];
//       commentMap[comment._id] = comment;

//       if (comment.replyIds && comment.replyIds.length > 0) {
//         replyPromises.push(
//           Comment.find({
//             _id: { $in: comment.replyIds },
//             status: true,
//             isReply: true,
//           })
//             .then((replies) => {
//               if (replies && replies.length > 0) {
//                 comment.replies.push(...replies);
//               }
//             })
//             .catch((error) => {
//               console.error(
//                 `Error fetching replies for comment ${comment._id}:`,
//                 error
//               );
//             })
//         );
//       }
//     });

//   await Promise.all(replyPromises);

//   console.log("replyPromises:", replyPromises, "comments:", comments);

//   //   const nestedComments = [];
//   //   comments.forEach((comment) => {
//   //     if (comment.isReply && comment.parentCommentId) {
//   //       commentMap[comment.parentCommentId].replies.push(comment);
//   //     } else {
//   //       nestedComments.push(comment);
//   //     }
//   //   });

//   return comments;
// };

// const nestComments = async (comments) => {
//   const commentMap = {};
//   const replyPromises = [];

//   comments.forEach((comment) => {
//     // Initialize the replies array for each comment
//     comment.replies = [];
//     // Add the comment to the commentMap with its _id as the key
//     commentMap[comment._id] = comment;

//     if (comment.replyIds && comment.replyIds.length > 0) {
//       // Push a promise to replyPromises to fetch the replies
//       const replyPromise = Comment.find({
//         _id: { $in: comment.replyIds },
//         status: true,
//         isReply: true,
//       })
//         .then((replies) => {
//           if (replies && replies.length > 0) {
//             comment.replies.push(...replies);
//             console.log(
//               `Comment ${comment._id} after inserting replies:`,
//               comment.replies
//             );
//           }
//         })
//         .catch((error) => {
//           console.error(
//             `Error fetching replies for comment ${comment._id}:`,
//             error
//           );
//         });

//       replyPromises.push(replyPromise);
//     }
//   });

//   console.log("Reply promises:", replyPromises);

//   // Wait for all reply fetching promises to complete
//   await Promise.all(replyPromises);
//   const deepCopyComments = JSON.parse(JSON.stringify(comments));

//   console.log("Reply promises after awaiting:", replyPromises);

//   console.log("Final comments structure:", deepCopyComments);

//   return comments.filter((comment) => !comment.isReply);
// };

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
      console.log("replies:", replies);
      if (replies && replies.length > 0) {
        await comment.replies.push(replies);
        console.log(comment);
      }
    }
  }

  // const replyPromises = Promise.all(
  //   comments.map(async (comment) => {
  //     comment.replies = [];
  //     commentMap[comment._id] = comment;

  //     if (comment.replyIds && comment.replyIds.length > 0) {
  //       let replies = await Comment.find({
  //         _id: { $in: comment.replyIds },
  //         status: true,
  //         isReply: true,
  //       });
  //       console.log("replies:", replies);
  //       if (replies && replies.length > 0) {
  //         comment.replies = replies;
  //         console.log(comment);
  //       }
  //     }
  //   })
  // );

  console.log("Final comments structure:", comments);

  return comments.filter((comment) => !comment.isReply);
};

module.exports = { nestComments };
