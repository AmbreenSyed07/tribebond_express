/** @format */

const {
  addSweetShop,
  editSweetShop,
  getSweetsShops,
  getSweetShopById,
  deleteSweetShopImages,
  addSweetShopReview,
  searchSweet,
  deleteSweet,
} = require("../controller/sweets.controller");
const { verifyToken } = require("../middlewares/auth.middlewares");

const router = require("express").Router();

router.post("/add", verifyToken, addSweetShop);
router.put("/edit/:id", verifyToken, editSweetShop);
router.get("/display", verifyToken, getSweetsShops);
router.get("/display/:id", verifyToken, getSweetShopById);
router.post("/delete-images", verifyToken, deleteSweetShopImages);
router.post("/add-review", verifyToken, addSweetShopReview);
router.post("/search", verifyToken, searchSweet);
router.patch("/delete/:id", verifyToken, deleteSweet);

module.exports = router;
