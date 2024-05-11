const {
  addEducationTypes,
  addEducationalEntities,
  editEduEntities,
  getEducation,
} = require("../controller/educationTypes.controller");

const { verifyToken } = require("../middlewares/auth.middlewares");
const router = require("express").Router();

router.post("/add", verifyToken, addEducationTypes);
router.post("/add-entity", verifyToken, addEducationalEntities);
router.put("/edit-entity/:id", verifyToken, editEduEntities);
router.get("/display", verifyToken, getEducation);

module.exports = router;

