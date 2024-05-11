const jwt = require("jsonwebtoken");
const jwtSecret = "GRACE_JWT";
const expiresIn = "1d";

const createToken = (info) => {
  const accessToken = jwt.sign(info, jwtSecret, {
    expiresIn: expiresIn,
  });
  return accessToken;
};

const verifyToken = (token) => {
  try {
    const tokenData = jwt.verify(token, jwtSecret);
    return tokenData;
  } catch (error) {
    return false;
  }
};

module.exports = {
  createToken,
  verifyToken,
};
