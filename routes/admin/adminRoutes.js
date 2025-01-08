const express = require("express");
const router = express.Router();
const categoryRoutes = require("../../routes/admin/category/categoryRoutes");
const serviceRoutes = require("../../routes/admin/service/serviceRoutes");
const profieRoutes = require("../../routes/admin/profile/profileRoutes");
const proceduresRoutes = require("../../routes/procedures/proceduresRoutes");
router.use("/category", categoryRoutes);

router.use("/service", serviceRoutes);

router.use("/profile", profieRoutes);

router.use("/procedure", proceduresRoutes);

module.exports = router;
