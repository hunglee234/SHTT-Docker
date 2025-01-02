const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Tìm kiếm người dùng trong cơ sở dữ liệu
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = password === user.password; // Đổi sang hash nếu cần
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Tạo token JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    console.log(token);
    return token;

    // // Chuyển hướng dựa vào vai trò
    // if (user.role === "admin") {
    //   return res.json({
    //     message: "Login successful",
    //     redirect: "/admin/dashboard",
    //     token,
    //     role: user.role,
    //   });
    // } else if (user.role === "manager") {
    //   return res.json({
    //     message: "Login successful",
    //     redirect: "/manager/dashboard",
    //     token,
    //     role: user.role,
    //   });
    // } else {
    //   return res.status(403).json({ message: "Unauthorized role" });
    // }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
