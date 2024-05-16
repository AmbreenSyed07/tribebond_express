const {
  addEvent,
  editEvent,
  getEvents,
  deleteEvent,
  getEventById,
  deleteImages,
} = require("../controller/events.controller");
const { verifyToken } = require("../middlewares/auth.middlewares");

const router = require("express").Router();

router.post("/add", verifyToken, addEvent);
router.put("/edit/:id", verifyToken, editEvent);
router.get("/display", verifyToken, getEvents);
router.get("/display/:id", verifyToken, getEventById);
router.patch("/delete/:id", verifyToken, deleteEvent);
router.post("/delete-images", verifyToken, deleteImages);

module.exports = router;


