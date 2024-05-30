const router = require("express").Router();
const userRoutes = require("./user.routes");
const eduTypesRoutes = require("./enducationTypes.routes");
const constantRoutes = require("../routes/constants.routes");
const eventsRoutes = require("./events.routes");
const blogRoutes = require("./blogs.routes");
const restaurantRoutes = require("./halalRestaurant.routes");
const halalMeatRoutes = require("./halalMeat.routes");
const groceryRoutes = require("./grocery.routes");
const householdRoutes = require("./household.routes");
const foodCateringRoutes = require("./foodCatering.routes");
const rentalRoutes = require("./rental.routes");
const sweetsRoutes = require("./sweets.routes");
const electronicsRoutes = require("./electronics.routes");
const partyRoutes = require("./party.routes");
const legalRoutes = require("./legal.routes");
const automobileRoutes = require("./automobile.routes");
const doctorRoutes = require("./doctor.routes");
const healthRoutes = require("./health.routes");

router.use("/user", userRoutes);
router.use("/education-types", eduTypesRoutes);
router.use("/constants", constantRoutes);
router.use("/events", eventsRoutes);
router.use("/blogs", blogRoutes);
router.use("/halal-restaurants", restaurantRoutes);
router.use("/halal-meat", halalMeatRoutes);
router.use("/groceries", groceryRoutes);
router.use("/household-items", householdRoutes);
router.use("/food-catering", foodCateringRoutes);
router.use("/rental", rentalRoutes);
router.use("/sweets", sweetsRoutes);
router.use("/electronics", electronicsRoutes);
router.use("/party", partyRoutes);
router.use("/legal", legalRoutes);
router.use("/automobile", automobileRoutes);
router.use("/doctor", doctorRoutes);
router.use("/health", healthRoutes);

module.exports = router;