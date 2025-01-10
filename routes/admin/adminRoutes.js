const express = require("express");
const router = express.Router();
const categoryRoutes = require("../../routes/admin/category/categoryRoutes");
const serviceRoutes = require("../../routes/admin/service/serviceRoutes");
const profieRoutes = require("../../routes/admin/profile/profileRoutes");
const proceduresRoutes = require("../../routes/procedures/proceduresRoutes");
const customersRoutes = require("../../routes/admin/customers/customersRoutes");
const accountRoutes = require("../../routes/admin/account/accountRoutes");
const customerRoutes = require("../../routes/admin/customer/customerRoutes");

router.use("/category", categoryRoutes);

router.use("/service", serviceRoutes);

router.use("/profile", profieRoutes);

router.use("/procedure", proceduresRoutes);

router.use("/customers", customersRoutes);

router.use("/account", accountRoutes);

// Customer chính là Manager
router.use("/customer", customerRoutes);

module.exports = router;
