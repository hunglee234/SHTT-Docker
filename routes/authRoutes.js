const express = require("express");
const router = express.Router();
const {
  login2,
  register,
  logout,
  forgotpassword,
  verifycode,
  resetpassword,
} = require("../controllers/auth/authController");

// Đăng ký tài khoản mới
router.post("/register", register);

// Đăng nhập
router.post("/login", login2);

// Đăng xuất
router.post("/logout", logout);

// Quên mật khẩu
router.post("/forgot-password", forgotpassword);
// Xác nhận mã code
router.post("/verify-code", verifycode);
// Đặt lại mật khẩu
router.post("/reset-password", resetpassword);

module.exports = router;
