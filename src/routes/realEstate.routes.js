/** @format */

const {
  addRealEstateRecord,
  editRealEstateRecord,
  getRealEstateRecords,
  getRealEstateRecordById,
  deleteRealEstateRecordImages,
  addRealEstateRecordReview,
} = require("../controller/realEstate.controller");
const { verifyToken } = require("../middlewares/auth.middlewares");

const router = require("express").Router();

router.post("/add", verifyToken, addRealEstateRecord);
router.put("/edit/:id", verifyToken, editRealEstateRecord);
router.get("/display", verifyToken, getRealEstateRecords);
router.get("/display/:id", verifyToken, getRealEstateRecordById);
router.post("/delete-images", verifyToken, deleteRealEstateRecordImages);
router.post("/add-review", verifyToken, addRealEstateRecordReview);

module.exports = router;
