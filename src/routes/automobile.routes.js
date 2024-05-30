/** @format */

const {
  addAutomobile,
  editAutomobile,
  getAutomobiles,
  getAutomobileById,
  deleteAutomobileImages,
  addAutomobileReview,
} = require("../controller/automobile.controller");
const { verifyToken } = require("../middlewares/auth.middlewares");

const router = require("express").Router();

router.post("/add", verifyToken, addAutomobile);
router.put("/edit/:id", verifyToken, editAutomobile);
router.get("/display", verifyToken, getAutomobiles);
router.get("/display/:id", verifyToken, getAutomobileById);
router.post("/delete-images", verifyToken, deleteAutomobileImages);
router.post("/add-review", verifyToken, addAutomobileReview);

module.exports = router;
