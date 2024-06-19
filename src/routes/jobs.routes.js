/** @format */

const {
  addJob,
  getJobByLocation,
  getJobById,
  deleteJob,
} = require("../controller/jobs.controller");
const { verifyToken } = require("../middlewares/auth.middlewares");

const router = require("express").Router();

router.post("/add", verifyToken, addJob);
router.get("/display", verifyToken, getJobByLocation);
router.get("/display/:id", verifyToken, getJobById);
router.patch("/delete/:id", verifyToken, deleteJob);

module.exports = router;
