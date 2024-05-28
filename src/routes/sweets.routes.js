/** @format */

const {
  addSweetShop,
  editSweetShop,
  getSweetsShops,
  getSweetShopById,
  deleteSweetShopImages,
  addSweetShopReview,
} = require("../controller/sweets.controller");
const { verifyToken } = require("../middlewares/auth.middlewares");

const router = require("express").Router();

router.post("/add", verifyToken, addSweetShop);
router.put("/edit/:id", verifyToken, editSweetShop);
router.get("/display", verifyToken, getSweetsShops);
router.get("/display/:id", verifyToken, getSweetShopById);
router.post("/delete-images", verifyToken, deleteSweetShopImages);
router.post("/add-review", verifyToken, addSweetShopReview);

module.exports = router;
