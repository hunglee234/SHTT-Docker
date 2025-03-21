const express = require("express");
const router = express.Router();
const categoryRoutes = require("../../routes/admin/category/categoryRoutes");
const serviceRoutes = require("../../routes/admin/service/serviceRoutes");
const profieRoutes = require("../../routes/admin/profile/profileRoutes");
const proceduresRoutes = require("../../routes/procedures/proceduresRoutes");
const documentsRoutes = require("../../routes/documents/documentsRoutes");
const customersRoutes = require("../../routes/admin/customers/customersRoutes");
const accountRoutes = require("../../routes/admin/account/accountRoutes");
const customerRoutes = require("../../routes/admin/customer/customerRoutes");
const ticketRoutes = require("../../routes/admin/ticket/ticketRoutes");
const contractRoutes = require("../../routes/admin/contract/contractRoutes");
const postRoutes = require("../../routes/post/postRoutes");

router.use("/category", categoryRoutes);

router.use("/service", serviceRoutes);

router.use("/profile", profieRoutes);

router.use("/ticket", ticketRoutes);

router.use("/procedure", proceduresRoutes);

router.use("/documents", documentsRoutes);

router.use("/customers", customersRoutes);

router.use("/account", accountRoutes);

router.use("/contract", contractRoutes);

router.use("/posts", postRoutes);
// Customer chính là Manager
router.use("/customer", customerRoutes);

module.exports = router;
