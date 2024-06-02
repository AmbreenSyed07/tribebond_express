const {
  registerUser,
  logInUser,
  saveFeedback,
  //   verifyUserJWTToken,
} = require("../controller/user.controller");
const { verifyToken } = require("../middlewares/auth.middlewares");

const router = require("express").Router();

router.post("/register", registerUser);
router.post("/login", logInUser);
router.post("/feedback", verifyToken, saveFeedback);
// router.post("/verify", verifyTokenAndAdmin, verifyUserJWTToken);

module.exports = router;
