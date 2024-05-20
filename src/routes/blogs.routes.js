const router = require("express").Router();
const { verifyToken } = require("../middlewares/auth.middlewares");
const {
  addBlog,
  addComment,
  replyToComment,
  displayBlogs,
  displayAllComments,
} = require("../controller/blogs.controller");

router.post("/add", verifyToken, addBlog);
router.post("/add-comment", verifyToken, addComment);
router.post("/comment-reply", verifyToken, replyToComment);
router.get("/display", verifyToken, displayBlogs);
router.post("/comments/display", verifyToken, displayAllComments);

module.exports = router;
