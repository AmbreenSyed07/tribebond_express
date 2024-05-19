const router = require("express").Router();
const userRoutes = require("./user.routes");
const eduTypesRoutes = require("./enducationTypes.routes");
const constantRoutes = require("../routes/constants.routes");
const eventsRoutes = require("../routes/events.routes");
const blogRoutes = require("../routes/blogs.routes");

router.use("/user", userRoutes);
router.use("/education-types", eduTypesRoutes);
router.use("/constants", constantRoutes);
router.use("/events", eventsRoutes);
router.use("/blogs", blogRoutes);

module.exports = router;

