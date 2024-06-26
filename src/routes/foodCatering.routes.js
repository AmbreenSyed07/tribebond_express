/** @format */

const {
  addDiningLocation,
  editDiningLocation,
  getDiningLocations,
  getDiningLocationById,
  deleteDiningLocationImages,
  addDiningLocationReview,
  searchFoodCatering,
  deleteDiningLocation,
} = require("../controller/foodCatering.controller");
const { verifyToken } = require("../middlewares/auth.middlewares");

const router = require("express").Router();

router.post("/add", verifyToken, addDiningLocation);
router.put("/edit/:id", verifyToken, editDiningLocation);
router.get("/display", verifyToken, getDiningLocations);
router.get("/display/:id", verifyToken, getDiningLocationById);
router.post("/delete-images", verifyToken, deleteDiningLocationImages);
router.post("/add-review", verifyToken, addDiningLocationReview);
router.post("/search", verifyToken, searchFoodCatering);
router.patch("/delete/:id", verifyToken, deleteDiningLocation);

module.exports = router;
