const axios = require("axios");
const User = require("../../models/User/User");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const SECRET_KEY = "hungdzvclra";
// Hàm để bắt đầu quá trình xác thực với Google
exports.getAuthUrl = (req, res, next) => {
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })(req, res, next);
};

exports.handleCallback = async (req, res) => {
  passport.authenticate(
    "google",
    { session: false },
    async (err, user, info) => {
      if (err) {
        console.error("Authentication error:", err);
        return res.status(500).json({ message: "Internal server error" });
      }
      try {
        // Tạo JWT token hoặc xử lý user
        const token = jwt.sign(
          { id: user._id, email: user.email },
          process.env.SECRET_KEY,
          { expiresIn: "1h" }
        );
        // Gửi token trong response hoặc header
        res.setHeader("Authorization", `Bearer ${token}`);
        // return res
        //   .status(200)
        //   .json({ message: "Authentication successful", token });
        // Chuyển hướng đến trang thành công hoặc gửi response JSON
        return res.redirect("https://www.google.com/");
      } catch (error) {
        console.error("Error creating token:", error);
        return res.status(500).json({ message: "Error generating token" });
      }
    }
  )(req, res);
};
