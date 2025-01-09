const express = require("express");
const router = express.Router();
const staffRoutes = require("../../routes/manager/staff/staffRoutes");

router.use("/staff", staffRoutes);

module.exports = router;
