const router = require("express").Router();
const { verifyToken } = require("../middlewares/auth.middlewares");
const {
  addBlog,
  addComment,
  replyToComment,
  displayBlogs,
  displayAllComments,
  deleteBlog,
} = require("../controller/blogs.controller");

router.post("/add", verifyToken, addBlog);
router.post("/add-comment", verifyToken, addComment);
router.post("/comment-reply", verifyToken, replyToComment);
router.get("/display", verifyToken, displayBlogs);
router.post("/comments/display", verifyToken, displayAllComments);
router.patch("/delete/:id", verifyToken, deleteBlog);


module.exports = router;
