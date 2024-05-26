const router = require("express").Router();
const userRoutes = require("./user.routes");
const eduTypesRoutes = require("./enducationTypes.routes");
const constantRoutes = require("../routes/constants.routes");
const eventsRoutes = require("../routes/events.routes");
const blogRoutes = require("../routes/blogs.routes");
const restaurantRoutes = require("../routes/halalRestaurant.routes");
const halalMeatRoutes = require("../routes/halalMeat.routes");

router.use("/user", userRoutes);
router.use("/education-types", eduTypesRoutes);
router.use("/constants", constantRoutes);
router.use("/events", eventsRoutes);
router.use("/blogs", blogRoutes);
router.use("/halal-restaurants", restaurantRoutes);
router.use("/halal-meat", halalMeatRoutes);

module.exports = router;

