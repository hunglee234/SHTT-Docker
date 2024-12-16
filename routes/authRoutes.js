const express = require("express");
const { register, login } = require("../controllers/auth/authController");

const router = express.Router();

// Đăng ký tài khoản mới
router.post("/register", register);

// Đăng nhập
router.post("/login", login);

module.exports = router;
