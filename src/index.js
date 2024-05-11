require("dotenv").config();

const express = require("express");
const app = express();const cors = require("cors");
require("./model/index")
// Middleware to parse JSON bodies
const fileUpload = require("express-fileupload");
const path = require("path");

app.use("/public", express.static(path.join(__dirname, "public")));
app.use(fileUpload());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors("*"));

// Define server port
const PORT = process.env.PORT || 8713;

const apiRoutes = require("./routes/api.routes");
const { sendResponse } = require("./helper/local.helpers");

app.use("/api", apiRoutes);


app.all("*", function (req, res) {
  return sendResponse(res, 404, false, "Page Not Found");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
