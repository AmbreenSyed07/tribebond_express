const router = require("express").Router();
const { verifyToken } = require("../middlewares/auth.middlewares");
const {
  addBlog,
  addComment,
  replyToComment,
  displayBlogs,
  displayAllComments,
  deleteBlog,
  deleteComment,
  likeBlog,
} = require("../controller/blogs.controller");

router.post("/add", verifyToken, addBlog);
router.post("/add-comment", verifyToken, addComment);
router.post("/comment-reply", verifyToken, replyToComment);
router.get("/display", verifyToken, displayBlogs);
router.post("/comments/display", verifyToken, displayAllComments);
router.patch("/delete/:id", verifyToken, deleteBlog);
router.patch("/delete/:blog_id/:comment_id", verifyToken, deleteComment);
router.post("/like/:blog_id",verifyToken,likeBlog);

module.exports = router;
