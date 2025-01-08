const express = require("express");
const router = express.Router();
const ticketRoutes = require("../../routes/user/ticket/ticket");
const infoAccount = require("../../controllers/info/infoAccount");
const categoryRoutes = require("../../routes/user/category/categoryRoutes");
const serviceRoutes = require("../../routes/user/service/serviceRoutes");
const upload = require("../../utils/multer");

router.use("/category", categoryRoutes);

router.use("/service", serviceRoutes);

router.use("/ticket", ticketRoutes);

// Lấy thông tin tài khoản
router.get("/me", infoAccount.getMe);

// Update thông tin tài khoản
router.put("/me", upload.single("avatar"), infoAccount.updateMe);

module.exports = router;
