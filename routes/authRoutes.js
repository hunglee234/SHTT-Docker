const express = require("express");
const router = express.Router();
const passport = require("passport");
require("../config/passportGG");
require("../config/passportFB");
const facebookRoutes = require("../routes/facebook/facebook");
const googleAuthRoutes = require("../routes/google/googleAuthRoutes");
const {
  register,
  login,
  logout,
} = require("../controllers/auth/authController");

// Đăng ký tài khoản mới
router.post("/register", register);

// Đăng nhập
router.post("/login", login);

// Sử dụng các routes google
router.use("/google", googleAuthRoutes);

// Sử dụng các routes facebook
router.use("/facebook", facebookRoutes);

// Đăng xuất
router.post("/logout", logout);

// Bổ sung tính năng quên mật khẩu

module.exports = router;
