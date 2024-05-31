/** @format */

const {
  addElectronic,
  editElectronic,
  getElectronics,
  getElectronicById,
  deleteElectronicImages,
  addElectronicReview,
  searchElectronic,
} = require("../controller/electronics.controller");
const { verifyToken } = require("../middlewares/auth.middlewares");

const router = require("express").Router();

router.post("/add", verifyToken, addElectronic);
router.put("/edit/:id", verifyToken, editElectronic);
router.get("/display", verifyToken, getElectronics);
router.get("/display/:id", verifyToken, getElectronicById);
router.post("/delete-images", verifyToken, deleteElectronicImages);
router.post("/add-review", verifyToken, addElectronicReview);
router.post("/search", verifyToken, searchElectronic);

module.exports = router;
