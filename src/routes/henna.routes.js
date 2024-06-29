/** @format */

const {
  addHenna,
  editHenna,
  getHennas,
  getHennaById,
  deleteHennaImages,
  addHennaReview,
  searchHenna,
  deleteHenna,
} = require("../controller/henna.controller");
const { verifyToken } = require("../middlewares/auth.middlewares");

const router = require("express").Router();

router.post("/add", verifyToken, addHenna);
router.put("/edit/:id", verifyToken, editHenna);
router.get("/display", verifyToken, getHennas);
router.get("/display/:id", verifyToken, getHennaById);
router.post("/delete-images", verifyToken, deleteHennaImages);
router.post("/add-review", verifyToken, addHennaReview);
router.post("/search", verifyToken, searchHenna);
router.patch("/delete/:id", verifyToken, deleteHenna);

module.exports = router;
