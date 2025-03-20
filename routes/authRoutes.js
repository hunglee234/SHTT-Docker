const express = require("express");
const router = express.Router();
const {
  loginManager,
  loginAdmin,
  register,
  logout,
  forgotpassword,
  verifycode,
  resetpassword,
} = require("../controllers/auth/authController");

// Đăng ký tài khoản mới
router.post("/register", register);

// Đăng nhập Manager
router.post("/login/manager", loginManager);

// Đăng nhập Admin & Superadmin
router.post("/login/admin", loginAdmin);

// Đăng xuất
router.post("/logout", logout);

// Quên mật khẩu
router.post("/forgot-password", forgotpassword);
// Xác nhận mã code
router.post("/verify-code", verifycode);
// Đặt lại mật khẩu
router.post("/reset-password", resetpassword);

module.exports = router;
