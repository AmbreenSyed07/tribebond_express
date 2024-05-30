/** @format */

const {
  addDoctor,
  editDoctor,
  getDoctors,
  getDoctorById,
  deleteDoctorImages,
  addDoctorReview,
} = require("../controller/doctor.controller");
const { verifyToken } = require("../middlewares/auth.middlewares");

const router = require("express").Router();

router.post("/add", verifyToken, addDoctor);
router.put("/edit/:id", verifyToken, editDoctor);
router.get("/display", verifyToken, getDoctors);
router.get("/display/:id", verifyToken, getDoctorById);
router.post("/delete-images", verifyToken, deleteDoctorImages);
router.post("/add-review", verifyToken, addDoctorReview);

module.exports = router;
