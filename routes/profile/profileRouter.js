const express = require("express");
const { authenticateToken } = require("../../middleware/auth");
const router = express.Router();
const {
  createProfile,
  registerAndCreateProfile,
} = require("../../controllers/profile/profileController");

// Thêm sửa xóa Hồ sơ
// Hồ sơ đăng ký dịch vụ (Cần đăng nhập)
// Phân quyền cho Manager và Admin
router.post("/create", authenticateToken, createProfile);

// Lấy danh sách hồ sơ

// Lấy chi tiết hồ sơ theo ID

// Xóa hồ sơ đăng ký

// Chỉnh sửa hồ sơ đăng ký

module.exports = router;
