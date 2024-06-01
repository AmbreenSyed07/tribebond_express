/** @format */

const {
  addHelpRequest,
  editHelpRequest,
  getHelpRequests,
  getHelpRequestById,
  deleteImages,
  addReview,
  deleteHelpRequest,
} = require("../controller/askForHelp.controller");
const { verifyToken } = require("../middlewares/auth.middlewares");

const router = require("express").Router();

router.post("/add", verifyToken, addHelpRequest);
router.put("/edit/:id", verifyToken, editHelpRequest);
router.get("/display", verifyToken, getHelpRequests);
router.get("/display/:id", verifyToken, getHelpRequestById);
router.post("/delete-images", verifyToken, deleteImages);
router.post("/add-review", verifyToken, addReview);
router.patch("/delete/:id", verifyToken, deleteHelpRequest);

module.exports = router;
