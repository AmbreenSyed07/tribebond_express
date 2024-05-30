/** @format */

const {
  addParty,
  editParty,
  getParties,
  getPartyById,
  deletePartyImages,
  addPartyReview,
} = require("../controller/party.controller");
const { verifyToken } = require("../middlewares/auth.middlewares");

const router = require("express").Router();

router.post("/add", verifyToken, addParty);
router.put("/edit/:id", verifyToken, editParty);
router.get("/display", verifyToken, getParties);
router.get("/display/:id", verifyToken, getPartyById);
router.post("/delete-images", verifyToken, deletePartyImages);
router.post("/add-review", verifyToken, addPartyReview);

module.exports = router;
