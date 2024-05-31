/** @format */

const {
  addLegal,
  editLegal,
  getLegals,
  getLegalById,
  deleteLegalImages,
  addLegalReview,
  searchLegal,
} = require("../controller/legal.controller");
const { verifyToken } = require("../middlewares/auth.middlewares");

const router = require("express").Router();

router.post("/add", verifyToken, addLegal);
router.put("/edit/:id", verifyToken, editLegal);
router.get("/display", verifyToken, getLegals);
router.get("/display/:id", verifyToken, getLegalById);
router.post("/delete-images", verifyToken, deleteLegalImages);
router.post("/add-review", verifyToken, addLegalReview);
router.post("/search", verifyToken, searchLegal);

module.exports = router;
