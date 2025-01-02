const express = require("express");
const router = express.Router();
const googleAuthController = require("../../controllers/google/authController");

// Route đăng nhập với Google
router.get("/auth", googleAuthController.getAuthUrl);

// Route callback Google sau khi xác thực
router.get("/callback", googleAuthController.handleCallback);

// Route đăng xuất
router.get("/logout", (req, res) => {
  res.send("Logged out");
});

module.exports = router;
