const {
  addRestaurant,
  editRestaurant,
  getRestaurants,
  getRestaurantById,
  deleteImages,
  addReview,
  searchHalalRestaurant,
} = require("../controller/halalRestaurant.controller");
const { verifyToken } = require("../middlewares/auth.middlewares");

const router = require("express").Router();

router.post("/add", verifyToken, addRestaurant);
router.put("/edit/:id", verifyToken, editRestaurant);
router.get("/display", verifyToken, getRestaurants);
router.get("/display/:id", verifyToken, getRestaurantById);
router.post("/delete-images", verifyToken, deleteImages);
router.post("/add-review", verifyToken, addReview);
router.post("/search", verifyToken, searchHalalRestaurant);

module.exports = router;
