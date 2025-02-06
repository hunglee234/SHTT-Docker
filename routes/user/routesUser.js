const express = require("express");
const router = express.Router();
const ticketRoutes = require("../../routes/user/ticket/ticket");
const infoAccount = require("../../controllers/info/infoAccount");
const categoryRoutes = require("../../routes/user/category/categoryRoutes");
const serviceRoutes = require("../../routes/user/service/serviceRoutes");
const upload = require("../../utils/multer");
const regisService = require("../../routes/sevice/serviceRouter");
const proceduresRoutes = require("../../routes/procedures/proceduresRoutes");
const documentsUserRoutes = require("../../routes/documents/documentsUserRoutes");
const notiRoutes = require("../../routes/noti/notiRoutes");
const contractRoutes = require("../../routes/contract/contractRoutes");

router.use("/category", categoryRoutes);

router.use("/service", serviceRoutes);

router.use("/ticket", ticketRoutes);

router.use("/procedure", proceduresRoutes);

router.use("/documents", documentsUserRoutes);

router.use("/contract", contractRoutes);

router.use("/noti", notiRoutes);
// Lấy thông tin tài khoản
router.get("/me", infoAccount.getMe);

// Update thông tin tài khoản
router.put("/me", upload.single("avatar"), infoAccount.updateMe);

router.use("/", regisService);

module.exports = router;
