const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../../models/User/User");
const Role = require("../../models/Role");
const Account = require("../../models/Account/Account");
const StaffAccount = require("../../models/Account/InfoStaff");
const SECRET_KEY = "hungdzvclra";
const generateAutoCode = require("../../utils/autoIncrement");

exports.login = async (req, res) => {
  const { email, password } = req.body;
  // console.log(req.body);
  try {
    user = await User.findOne({ email }).populate("role");
    if (user) {
      accountType = "User";
    } else {
      user = await Account.findOne({ email }).populate("role");
      if (user) {
        accountType = "Account";
        const staffAccount = await StaffAccount.findOne({
          account: user._id,
        });
        user.staffAccount = staffAccount;
      }
    }
    // console.log("a", user);
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

    const accountWithAvatar = await StaffAccount.findOne({
      account: user._id,
    }).populate({
      path: "avatar",
      select: "url",
    });

    // console.log(accountWithAvatar);
    const avatarUrl = accountWithAvatar.avatar?.url || null;
    // Trả về token và thông tin người dùng
    return res.json({
      message: "Login successful",
      token,
      accountType,
      user: {
        avatar: avatarUrl,
        username: user.username,
        id: user.staffAccount._id,
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
    const existingAccount = await Account.findOne({ email });
    if (existingAccount) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Tìm vai trò mặc định "Manager"
    const userAccount = await Role.findOne({ name: "Manager" });
    if (!userAccount) {
      return res
        .status(500)
        .json({ message: "Default role 'Manager' not found" });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo người dùng mới với vai trò mặc định
    const newAccount = new Account({
      fullName,
      email,
      password: hashedPassword,
      role: userAccount._id,
    });

    // Lưu người dùng vào cơ sở dữ liệu
    const savedAccount = await newAccount.save();

    const staffcodeAuto = await generateAutoCode("staffCode", "KH", 2);
    // Tạo InfoAccount
    const newInfoStaff = new StaffAccount({
      account: savedAccount._id,
      staffCode: staffcodeAuto,
    });
    const savedInfoStaff = await newInfoStaff.save();

    // Phản hồi thành công
    res.status(201).json({
      message: "Khách hàng đăng ký thành công",
      account: savedAccount,
      infoStaff: savedInfoStaff,
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
