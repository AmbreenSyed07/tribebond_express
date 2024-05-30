/** @format */

const {
  addHealthRecord,
  editHealthRecord,
  getHealthRecords,
  getHealthRecordById,
  deleteHealthRecordImages,
  addHealthRecordReview,
} = require("../controller/health.controller");
const { verifyToken } = require("../middlewares/auth.middlewares");

const router = require("express").Router();

router.post("/add", verifyToken, addHealthRecord);
router.put("/edit/:id", verifyToken, editHealthRecord);
router.get("/display", verifyToken, getHealthRecords);
router.get("/display/:id", verifyToken, getHealthRecordById);
router.post("/delete-images", verifyToken, deleteHealthRecordImages);
router.post("/add-review", verifyToken, addHealthRecordReview);

module.exports = router;
