/** @format */

const {
  addGiveawayItem,
  editGiveawayItem,
  getGiveawayItems,
  getGiveawayItemById,
  deleteImages,
  addReview,
  deleteGiveaway,
} = require("../controller/freeGiveaway.controller");
const { verifyToken } = require("../middlewares/auth.middlewares");

const router = require("express").Router();

router.post("/add", verifyToken, addGiveawayItem);
router.put("/edit/:id", verifyToken, editGiveawayItem);
router.get("/display", verifyToken, getGiveawayItems);
router.get("/display/:id", verifyToken, getGiveawayItemById);
router.post("/delete-images", verifyToken, deleteImages);
router.post("/add-review", verifyToken, addReview);
router.patch("/delete/:id", verifyToken, deleteGiveaway);

module.exports = router;
