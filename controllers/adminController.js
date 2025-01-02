const bcrypt = require("bcrypt"); // Hashing mật khẩu
const User = require("../models/User");
const Role = require("../models/Role");

// Lấy danh sách người dùng
exports.getAllUsers = async (req, res) => {
  try {
    // Lấy danh sách người dùng và populate thông tin role từ collection Role
    const users = await User.find({}).populate("role", "name permissions"); // Populate thông tin role (name và permissions)
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Tạo một người dùng mới
exports.createUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash mật khẩu
    const newUser = new User({
      email,
      password: hashedPassword,
      role: "user", // Mặc định role là "user"
    });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
