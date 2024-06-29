/** @format */

const {
  addQurbani,
  editQurbani,
  getQurbanis,
  getQurbaniById,
  deleteQurbaniImages,
  addQurbaniReview,
  searchQurbani,
  deleteQurbani,
} = require("../controller/qurbani.controller");
const { verifyToken } = require("../middlewares/auth.middlewares");

const router = require("express").Router();

router.post("/add", verifyToken, addQurbani);
router.put("/edit/:id", verifyToken, editQurbani);
router.get("/display", verifyToken, getQurbanis);
router.get("/display/:id", verifyToken, getQurbaniById);
router.post("/delete-images", verifyToken, deleteQurbaniImages);
router.post("/add-review", verifyToken, addQurbaniReview);
router.post("/search", verifyToken, searchQurbani);
router.patch("/delete/:id", verifyToken, deleteQurbani);

module.exports = router;
