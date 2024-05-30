/** @format */

const {
  addBeautyRecord,
  editBeautyRecord,
  getBeautyRecords,
  getBeautyRecordById,
  deleteBeautyRecordImages,
  addBeautyRecordReview,
} = require("../controller/beauty.controller");
const { verifyToken } = require("../middlewares/auth.middlewares");

const router = require("express").Router();

router.post("/add", verifyToken, addBeautyRecord);
router.put("/edit/:id", verifyToken, editBeautyRecord);
router.get("/display", verifyToken, getBeautyRecords);
router.get("/display/:id", verifyToken, getBeautyRecordById);
router.post("/delete-images", verifyToken, deleteBeautyRecordImages);
router.post("/add-review", verifyToken, addBeautyRecordReview);

module.exports = router;
