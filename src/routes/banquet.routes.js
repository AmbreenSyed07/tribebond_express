/** @format */

const {
  addBanquet,
  editBanquet,
  getBanquets,
  getBanquetById,
  deleteBanquetImages,
  addBanquetReview,
  searchBanquet,
  deleteBanquet,
} = require("../controller/banquet.controller");
const { verifyToken } = require("../middlewares/auth.middlewares");

const router = require("express").Router();

router.post("/add", verifyToken, addBanquet);
router.put("/edit/:id", verifyToken, editBanquet);
router.get("/display", verifyToken, getBanquets);
router.get("/display/:id", verifyToken, getBanquetById);
router.post("/delete-images", verifyToken, deleteBanquetImages);
router.post("/add-review", verifyToken, addBanquetReview);
router.post("/search", verifyToken, searchBanquet);
router.patch("/delete/:id", verifyToken, deleteBanquet);

module.exports = router;
