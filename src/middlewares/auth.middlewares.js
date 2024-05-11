const { verifyToken: verifyJWTToken } = require("../helper/jwt.helpers");
const { sendResponse } = require("../helper/local.helpers");

const verifyToken = (req, res, next) => {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer")) {
    const token = auth.split(" ")[1];
    const tokenData = verifyJWTToken(token);
    if (tokenData === false) {
      res.status(403).json({ ok: false, message: "Token is not valid!" });
    } else {
      req.tokenData = tokenData;
      next();
    }
  } else {
    return sendResponse(res, 401, false, "You are not authenticated!");
  }
};

const verifyTokenAndAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.tokenData.role_id > 0) {
      next();
    } else {
      return sendResponse(res, 403, false, "You are not alowed to do that!");
    }
  });
};

module.exports = {
  verifyToken,
  verifyTokenAndAdmin,
};
