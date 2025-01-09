const express = require("express");
const router = express.Router();
const categoryRoutes = require("../../routes/admin/category/categoryRoutes");
const serviceRoutes = require("../../routes/admin/service/serviceRoutes");
const profieRoutes = require("../../routes/admin/profile/profileRoutes");
const proceduresRoutes = require("../../routes/procedures/proceduresRoutes");
const accountRoutes = require("../../routes/admin/account/accountRoutes");

router.use("/category", categoryRoutes);

router.use("/service", serviceRoutes);

router.use("/profile", profieRoutes);

router.use("/procedure", proceduresRoutes);

router.use("/account", accountRoutes);

module.exports = router;
