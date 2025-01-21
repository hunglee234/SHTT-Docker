const express = require("express");
const router = express.Router();
const {
  login2,
  register,
  logout,
} = require("../controllers/auth/authController");

// Đăng ký tài khoản mới
router.post("/register", register);

// Đăng nhập
router.post("/login", login2);

// Đăng xuất
router.post("/logout", logout);

// Bổ sung tính năng quên mật khẩu

module.exports = router;
