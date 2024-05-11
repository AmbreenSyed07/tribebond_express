const { cities } = require("../constants/city.constants");
const { asyncErrorHandler } = require("../helper/async-error.helper");
const { sendResponse } = require("../helper/local.helpers");

const router = require("express").Router();

router.get("/cities", async (req, res) => {
  asyncErrorHandler(async () => {
    let availableCities = cities;
    return sendResponse(res, 200, "Available cities fetched.", availableCities);
  }, res);
});

module.exports = router;


