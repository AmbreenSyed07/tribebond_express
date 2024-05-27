/** @format */

const {
  addHouseholdItem,
  editHouseholdItem,
  getHouseholdItems,
  getHouseholdItemById,
  deleteImages,
  addReview,
} = require("../controller/household.controller");
const {verifyToken} = require("../middlewares/auth.middlewares");

const router = require("express").Router();

router.post("/add", verifyToken, addHouseholdItem);
router.put("/edit/:id", verifyToken, editHouseholdItem);
router.get("/display", verifyToken, getHouseholdItems);
router.get("/display/:id", verifyToken, getHouseholdItemById);
router.post("/delete-images", verifyToken, deleteImages);
router.post("/add-review", verifyToken, addReview);

module.exports = router;
