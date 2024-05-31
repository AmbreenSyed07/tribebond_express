/** @format */

const {
  addBuyNSell,
  editBuyNSell,
  getBuyNSellRecords,
  getBuyNSellById,
  deleteBuyNSellImages,
  addBuyNSellReview,
} = require("../controller/buynsell.controller");
const { verifyToken } = require("../middlewares/auth.middlewares");

const router = require("express").Router();

router.post("/add", verifyToken, addBuyNSell);
router.put("/edit/:id", verifyToken, editBuyNSell);
router.get("/display", verifyToken, getBuyNSellRecords);
router.get("/display/:id", verifyToken, getBuyNSellById);
router.post("/delete-images", verifyToken, deleteBuyNSellImages);
router.post("/add-review", verifyToken, addBuyNSellReview);

module.exports = router;
