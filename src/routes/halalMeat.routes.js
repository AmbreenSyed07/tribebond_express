const {
  addMeat,
  editMeat,
  getMeats,
  getMeatById,
  deleteImages,
  addReview,
  searchHalalMeat,
} = require("../controller/halalMeat.controller");
const { verifyToken } = require("../middlewares/auth.middlewares");

const router = require("express").Router();

router.post("/add", verifyToken, addMeat);
router.put("/edit/:id", verifyToken, editMeat);
router.get("/display", verifyToken, getMeats);
router.get("/display/:id", verifyToken, getMeatById);
router.post("/delete-images", verifyToken, deleteImages);
router.post("/add-review", verifyToken, addReview);
router.post("/search", verifyToken, searchHalalMeat);

module.exports = router;
