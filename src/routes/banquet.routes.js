/** @format */

const {
  addBanquet,
  editBanquet,
  getBanquets,
  getBanquetById,
  deleteBanquetImages,
  addBanquetReview,
} = require("../controller/banquet.controller");
const { verifyToken } = require("../middlewares/auth.middlewares");

const router = require("express").Router();

router.post("/add", verifyToken, addBanquet);
router.put("/edit/:id", verifyToken, editBanquet);
router.get("/display", verifyToken, getBanquets);
router.get("/display/:id", verifyToken, getBanquetById);
router.post("/delete-images", verifyToken, deleteBanquetImages);
router.post("/add-review", verifyToken, addBanquetReview);

module.exports = router;
