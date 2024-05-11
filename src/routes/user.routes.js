const {
  registerUser,
  logInUser,
//   verifyUserJWTToken,
} = require("../controller/user.controller");

const router = require("express").Router();

router.post("/register", registerUser);
router.post("/login", logInUser);
// router.post("/verify", verifyTokenAndAdmin, verifyUserJWTToken);

module.exports = router;
