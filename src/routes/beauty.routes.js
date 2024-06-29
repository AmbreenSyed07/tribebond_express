/** @format */

const {
  addBeautyRecord,
  editBeautyRecord,
  getBeautyRecords,
  getBeautyRecordById,
  deleteBeautyRecordImages,
  addBeautyRecordReview,
  searchBeautyRecord,
  deleteBeautyRecord,
} = require("../controller/beauty.controller");
const { verifyToken } = require("../middlewares/auth.middlewares");

const router = require("express").Router();

router.post("/add", verifyToken, addBeautyRecord);
router.put("/edit/:id", verifyToken, editBeautyRecord);
router.get("/display", verifyToken, getBeautyRecords);
router.get("/display/:id", verifyToken, getBeautyRecordById);
router.post("/delete-images", verifyToken, deleteBeautyRecordImages);
router.post("/add-review", verifyToken, addBeautyRecordReview);
router.post("/search", verifyToken, searchBeautyRecord);
router.patch("/delete/:id", verifyToken, deleteBeautyRecord);

module.exports = router;
