const {
  addEvent,
  editEvent,
  getEvents,
  deleteEvent,
} = require("../controller/events.controller");
const { verifyToken } = require("../middlewares/auth.middlewares");

const router = require("express").Router();

router.post("/add", verifyToken, addEvent);
router.put("/edit/:id", verifyToken, editEvent);
router.get("/display", verifyToken, getEvents);
router.patch("/delete/:id", verifyToken, deleteEvent);

module.exports = router;


