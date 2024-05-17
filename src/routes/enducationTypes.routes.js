const {
  addEducationTypes,
  addEducationalEntities,
  editEduEntities,
  getEducation,
  deleteEduEntities,
  getEducationById,
  deleteEduImages,
  addReview,
} = require("../controller/educationTypes.controller");

const { verifyToken } = require("../middlewares/auth.middlewares");
const router = require("express").Router();

router.post("/add", verifyToken, addEducationTypes);
router.post("/add-entity", verifyToken, addEducationalEntities);
router.put("/edit-entity/:id", verifyToken, editEduEntities);
router.patch("/delete-entity/:id", verifyToken, deleteEduEntities);
router.get("/display", verifyToken, getEducation);
router.get("/display/:id", verifyToken, getEducationById);
router.post("/delete-images", verifyToken, deleteEduImages);
router.post("/add-review", verifyToken, addReview);

module.exports = router;

