const {
  addGrocery,
  editGrocery,
  getGroceries,
  getGroceryById,
  deleteImages,
  addReview,
} = require("../controller/grocery.controller");
const { verifyToken } = require("../middlewares/auth.middlewares");

const router = require("express").Router();

router.post("/add", verifyToken, addGrocery);
router.put("/edit/:id", verifyToken, editGrocery);
router.get("/display", verifyToken, getGroceries);
router.get("/display/:id", verifyToken, getGroceryById);
router.post("/delete-images", verifyToken, deleteImages);
router.post("/add-review", verifyToken, addReview);

module.exports = router;
