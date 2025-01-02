const express = require("express");
const { login } = require("../controllers/authController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Route đăng nhập
router.post("/", login);

// // Middleware kiểm tra JWT và điều hướng theo role
// router.get("/verify", authenticateToken, (req, res) => {
//   const { role } = req.user;
//   if (role === "admin") {
//     // return res.redirect("/admin"); // Chuyển hướng admin
//     next();
//   } else if (role === "manager") {
//     next();
//     // return res.redirect("/manager"); // Chuyển hướng manager
//   } else {
//     return res.status(403).json({ message: "Unauthorized role" });
//   }
// });

module.exports = router;
