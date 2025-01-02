const express = require("express");
const router = express.Router();
const ticketRoutes = require("../../routes/user/ticket/ticket");

router.use("/ticket", ticketRoutes);

module.exports = router;
