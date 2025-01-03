const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../../models/User/User");
const InfoUser = require("../../models/User/InfoUser");
const Role = require("../../models/Role");
const Account = require("../../models/Account/Account");
const SECRET_KEY = "hungdzvclra";

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = null;
    let accountType = null;

    // Tìm kiếm email trong bảng User
    user = await User.findOne({ email }).populate("role");
    if (user) {
      accountType = "User";
    } else {
      user = await Account.findOne({ email }).populate("role");
      if (user) {
        accountType = "Account";
      }
    }

    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Tạo token JWT
    const token = jwt.sign(
      { id: user._id, role: user.role.name || user.role },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    user.token = token;
    await user.save();
    // Trả về token và thông tin người dùng
    return res.json({
      message: "Login successful",
      token,
      accountType,
      user: {
        id: user._id,
        email: user.email,
        role: user.role.name || user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.register = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    // Kiểm tra xem email đã tồn tại trong cơ sở dữ liệu chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Tìm vai trò mặc định "user"
    const userRole = await Role.findOne({ name: "User" });
    if (!userRole) {
      return res.status(500).json({ message: "Default role 'user' not found" });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo người dùng mới với vai trò mặc định
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      role: userRole._id,
    });

    // Lưu người dùng vào cơ sở dữ liệu
    const savedUser = await newUser.save();

    // Tạo InfoUser liên kết với User vừa tạo
    const newInfoUser = new InfoUser({
      role: userRole._id,
      user: savedUser._id,
    });
    const savedInfoUser = await newInfoUser.save();

    // Phản hồi thành công
    res.status(201).json({
      message: "Khách hàng đăng ký thành công",
      user: savedUser,
      infoUser: savedInfoUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.logout = (req, res) => {
  try {
    res.status(200).json({
      message: "Logout successful, please delete the token on client-side.",
    });
  } catch (error) {
    res.status(500).json({ message: "Logout failed", error: error.message });
  }
};
