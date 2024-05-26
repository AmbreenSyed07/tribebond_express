const router = require("express").Router();
const userRoutes = require("./user.routes");
const eduTypesRoutes = require("./enducationTypes.routes");
const constantRoutes = require("../routes/constants.routes");
const eventsRoutes = require("./events.routes");
const blogRoutes = require("./blogs.routes");
const restaurantRoutes = require("./halalRestaurant.routes");
const halalMeatRoutes = require("./halalMeat.routes");
const groceryRoutes = require("./grocery.routes");

router.use("/user", userRoutes);
router.use("/education-types", eduTypesRoutes);
router.use("/constants", constantRoutes);
router.use("/events", eventsRoutes);
router.use("/blogs", blogRoutes);
router.use("/halal-restaurants", restaurantRoutes);
router.use("/halal-meat", halalMeatRoutes);
router.use("/groceries", groceryRoutes);

module.exports = router;