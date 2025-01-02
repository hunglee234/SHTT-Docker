const express = require("express");
const router = express.Router();
const categoryRoutes = require("../../routes/admin/category/categoryRoutes");
const serviceRoutes = require("../../routes/admin/service/serviceRoutes");

router.use("/category", categoryRoutes);

router.use("/service", serviceRoutes);

// CRUD Lịch sử chỉnh sửa hồ sơ
// CRUD Bảng thông tin hồ sơ
// CRUD Danh sách dịch vụ đã đăng ký

module.exports = router;
