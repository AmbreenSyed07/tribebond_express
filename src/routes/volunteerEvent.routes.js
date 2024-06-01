/** @format */

const {
  addVolunteerEvent,
  editVolunteerEvent,
  getVolunteerEvents,
  getVolunteerEventById,
  deleteImages,
  addReview,
  deleteVolunteerEvent,
} = require("../controller/volunteerEvent.controller");
const { verifyToken } = require("../middlewares/auth.middlewares");

const router = require("express").Router();

router.post("/add", verifyToken, addVolunteerEvent);
router.put("/edit/:id", verifyToken, editVolunteerEvent);
router.get("/display", verifyToken, getVolunteerEvents);
router.get("/display/:id", verifyToken, getVolunteerEventById);
router.post("/delete-images", verifyToken, deleteImages);
router.post("/add-review", verifyToken, addReview);
router.patch("/delete/:id", verifyToken, deleteVolunteerEvent);

module.exports = router;
