const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../../models/User");
const Role = require("../../models/Role");
const SECRET_KEY = "hungdzvclra";

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Tìm kiếm người dùng trong cơ sở dữ liệu
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Kiểm tra mật khẩu (so sánh mật khẩu đã mã hóa)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Tạo token JWT
    const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, {
      expiresIn: "1h",
    });
    console.log(token);

    // Gửi token và thông tin người dùng
    return res.json({
      message: "Login successful",
      token,
      role: user.role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.register = async (req, res) => {
  const { email, password } = req.body; // Không nhận role từ client

  try {
    // Kiểm tra xem email đã tồn tại trong cơ sở dữ liệu chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Tìm vai trò mặc định "user"
    const userRole = await Role.findOne({ name: "user" });
    if (!userRole) {
      return res.status(500).json({ message: "Default role 'user' not found" });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo người dùng mới với vai trò mặc định
    const newUser = new User({
      email,
      password: hashedPassword,
      role: userRole._id, // Gắn role là "user"
    });

    // Lưu người dùng vào cơ sở dữ liệu
    await newUser.save();

    // Phản hồi thành công
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        email: newUser.email,
        role: userRole.name, // Trả về tên vai trò
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
