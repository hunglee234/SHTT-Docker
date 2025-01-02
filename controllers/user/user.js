const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../../models/User/User");
const InfoUser = require("../../models/User/InfoUser");
const Role = require("../../models/Role"); // Import thêm model Role
const moment = require("moment-timezone");

// Tạo User và InfoUser đồng thời
exports.createUserInfo = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      username,
      role,
      avatar,
      dateOfBirth,
      gender,
      phone,
      address,
      branch,
      status,
    } = req.body;

    // Lấy thời gian joinDate theo múi giờ Việt Nam
    const joinDate = moment.tz("Asia/Ho_Chi_Minh").format();

    // Tìm Role bằng tên (string) và lấy ObjectId
    const roleExists = await Role.findOne({ name: role });
    if (!roleExists) {
      return res.status(400).json({ error: "Role not found" });
    }

    const roleId = roleExists._id; // Lấy ObjectId của role

    // Tạo User
    const newUser = new User({
      fullName,
      email,
      password,
      username,
      role: roleId,
    });
    const savedUser = await newUser.save();

    // Tạo InfoUser liên kết với User vừa tạo
    const newInfoUser = new InfoUser({
      avatar,
      dateOfBirth,
      gender,
      phone,
      address,
      branch,
      status,
      joinDate,
      role: roleId, // Liên kết role (ObjectId) với InfoUser
      user: savedUser._id, // Liên kết User
    });
    const savedInfoUser = await newInfoUser.save();

    res.status(201).json({ user: savedUser, infoUser: savedInfoUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy thông tin đầy đủ của User + InfoUser
exports.getUserInfo = async (req, res) => {
  try {
    const { userId } = req.params;

    // Lấy thông tin User
    const user = await User.findById(userId).populate("role");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Lấy thông tin InfoUser liên quan
    const infoUser = await InfoUser.findOne({ user: userId }).populate("role");
    if (!infoUser) {
      return res.status(404).json({ error: "InfoUser not found" });
    }

    res.status(200).json({ user, infoUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUserInfo = async (req, res) => {
  try {
    const { userId } = req.params;

    // Kiểm tra tính hợp lệ của userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid userId format" });
    }

    const {
      fullName,
      email,
      password,
      username,
      avatar,
      dateOfBirth,
      gender,
      phone,
      address,
      branch,
      status,
      role,
      position,
    } = req.body;

    // Kiểm tra role nếu được gửi
    let roleId = null;
    if (role) {
      const roleExists = await Role.findOne({ name: role });
      if (!roleExists) {
        return res.status(400).json({ error: "Role not found" });
      }
      roleId = roleExists._id;
    }

    // Mã hóa mật khẩu nếu được gửi
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Cập nhật User
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...(fullName && { fullName }),
        ...(email && { email }),
        ...(password && { password: hashedPassword }),
        ...(username && { username }),
        ...(roleId && { role: roleId }),
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Cập nhật InfoUser
    const updatedInfoUser = await InfoUser.findOneAndUpdate(
      { user: userId },
      {
        ...(avatar && { avatar }),
        ...(dateOfBirth && { dateOfBirth }),
        ...(gender && { gender }),
        ...(phone && { phone }),
        ...(address && { address }),
        ...(branch && { branch }),
        ...(status && { status }),
        ...(roleId && { role: roleId }),
        ...(position && { position }),
      },
      { new: true }
    );

    if (!updatedInfoUser) {
      return res.status(404).json({ error: "InfoUser not found" });
    }

    // Populate dữ liệu trả về
    const populatedUser = await User.findById(userId).populate("role");
    const populatedInfoUser = await InfoUser.findOne({ user: userId }).populate(
      "role"
    );

    res.status(200).json({
      user: populatedUser,
      infoUser: populatedInfoUser,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Xóa cả User và InfoUser
exports.deleteUserInfo = async (req, res) => {
  try {
    const { userId } = req.params;
    // Xóa InfoUser trước
    const deletedInfoUser = await InfoUser.findOneAndDelete({ user: userId });
    if (!deletedInfoUser) {
      return res.status(404).json({ error: "InfoUserddd not found" });
    }

    // Xóa User sau
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User and InfoUser deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy toàn bộ danh sách User và InfoUser

exports.getAllUsersInfo = async (req, res) => {
  try {
    // Lấy tất cả User và populate thông tin role
    const users = await User.find().populate("role");

    // Kiểm tra nếu không có user nào
    if (users.length === 0) {
      return res.status(404).json({ error: "No users found" });
    }

    // Lấy thông tin InfoUser cho mỗi user và populate thông tin role trong InfoUser
    const usersWithInfo = await Promise.all(
      users.map(async (user) => {
        // Tìm InfoUser tương ứng với mỗi user và populate thông tin role trong InfoUser
        const infoUser = await InfoUser.findOne({ user: user._id }).populate(
          "role"
        );

        // Trả về thông tin người dùng và InfoUser đã populate
        return { user, infoUser };
      })
    );

    // Trả về danh sách người dùng và InfoUser
    res.status(200).json(usersWithInfo);
  } catch (err) {
    // Bắt lỗi nếu có vấn đề trong quá trình truy vấn
    res.status(500).json({ error: err.message });
  }
};
