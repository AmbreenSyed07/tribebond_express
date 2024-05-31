/** @format */

const {
  addRental,
  editRental,
  getRentals,
  getRentalById,
  deleteRentalImages,
  addRentalReview,
  searchRental,
} = require("../controller/rental.controller");
const { verifyToken } = require("../middlewares/auth.middlewares");

const router = require("express").Router();

router.post("/add", verifyToken, addRental);
router.put("/edit/:id", verifyToken, editRental);
router.get("/display", verifyToken, getRentals);
router.get("/display/:id", verifyToken, getRentalById);
router.post("/delete-images", verifyToken, deleteRentalImages);
router.post("/add-review", verifyToken, addRentalReview);
router.post("/search", verifyToken, searchRental);

module.exports = router;
