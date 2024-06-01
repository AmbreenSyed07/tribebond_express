/** @format */

const {
  addMosqueRecord,
  editMosqueRecord,
  getMosqueRecords,
  getMosqueRecordById,
  deleteMosqueRecordImages,
  addMosqueRecordReview,
  searchMosque,
} = require("../controller/mosque.controller");
const { verifyToken } = require("../middlewares/auth.middlewares");

const router = require("express").Router();

router.post("/add", verifyToken, addMosqueRecord);
router.put("/edit/:id", verifyToken, editMosqueRecord);
router.get("/display", verifyToken, getMosqueRecords);
router.get("/display/:id", verifyToken, getMosqueRecordById);
router.post("/delete-images", verifyToken, deleteMosqueRecordImages);
router.post("/add-review", verifyToken, addMosqueRecordReview);
router.post("/search", verifyToken, searchMosque);

module.exports = router;
