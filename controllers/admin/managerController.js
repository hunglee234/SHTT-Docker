const User = require("../../models/User/User");
const bcrypt = require("bcrypt");
const Account = require("../../models/Account/Account");
const StaffAccount = require("../../models/Account/InfoStaff");
const ManagerAccount = require("../../models/Account/InfoManager");
const Role = require("../../models/Role");
const moment = require("moment-timezone");
const mongoose = require("mongoose");

// Tạo tài khoản nhân viên
exports.createStaff = async (req, res) => {
  try {
    const {
      avatar,
      fullName,
      dateOfBirth,
      gender,
      email,
      phone,
      address,
      staffCode,
      username,
      password,
      position,
      joinDate,
      role: roleId,
    } = req.body;

    const userId = req.user.id;

    const account = await Account.findById(userId).populate("role");

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    if (!account.role || account.role.name !== "Manager") {
      return res
        .status(403)
        .json({ error: "Bạn không có quyền tạo nhân viên." });
    }
    // Check roleId
    const roleExists = await Role.findById(roleId);
    if (!roleExists) {
      return res.status(404).json({ error: "Role không tồn tại." });
    }

    // Kiểm tra số lượng nhân viên và cộng tác viên tạo bởi Manager này :
    const staffCount = await StaffAccount.countDocuments({
      createdByManager: account._id,
      position: "Nhân viên",
    });
    console.log(staffCount);
    const collaboratorCount = await StaffAccount.countDocuments({
      createdByManager: account._id,
      position: "Cộng tác viên",
    });
    console.log(collaboratorCount);
    // Điều kiện hạn chế số lượng
    if (position === "Nhân viên" && staffCount >= 2) {
      return res
        .status(400)
        .json({ error: "Bạn chỉ được tạo tối đa 2 Nhân viên." });
    }

    if (position === "Cộng tác viên" && collaboratorCount >= 1) {
      return res
        .status(400)
        .json({ error: "Bạn chỉ được tạo tối đa 1 Cộng Tác Viên." });
    }
    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo tài khoản mới trong collection Account
    const newAccount = new Account({
      avatar: avatar || null,
      fullName,
      email,
      password: hashedPassword,
      username,
      role: roleExists._id,
    });

    const savedAccount = await newAccount.save(); // Lưu tài khoản vào DB
    // Tạo thông tin nhân viên trong collection InfoStaff
    const newInfoStaff = new StaffAccount({
      account: savedAccount._id,
      position,
      dateOfBirth,
      gender,
      phone,
      address,
      createdByManager: account._id,
      staffCode,
      joinDate,
    });
    const savedInfoStaff = await newInfoStaff.save(); // Lưu thông tin nhân viên vào DB

    res.status(201).json({
      message: "Nhân viên đã được tạo thành công",
      account: savedAccount,
      infoStaff: savedInfoStaff,
    });
  } catch (error) {
    res.status(500).json({
      message: "Có lỗi xảy ra khi tạo nhân viên",
      error: error.message,
    });
  }
};

// Lấy danh sách nhân viên
exports.getFullStaffList = async (req, res) => {
  try {
    const userId = req.user.id;

    // Lấy thông tin tài khoản của người dùng hiện tại
    const currentUser = await Account.findById(userId).populate("role");

    if (!currentUser) {
      return res.status(404).json({ message: "Tài khoản không tồn tại." });
    }

    // Xác định quyền của người dùng
    const userRole = currentUser.role.name;

    let staffAccounts;
    if (userRole === "Admin") {
      // Admin có quyền xem toàn bộ danh sách
      staffAccounts = await StaffAccount.find().populate({
        path: "account",
        select: "fullName email username avatar role",
        populate: { path: "role", select: "name" },
      });
    } else if (userRole === "Manager") {
      // Manager chỉ được xem danh sách do họ tạo ra
      staffAccounts = await StaffAccount.find({
        createdByManager: currentUser._id,
      }).populate({
        path: "account",
        select: "fullName email username avatar role",
        populate: { path: "role", select: "name" },
      });
    } else {
      return res.status(403).json({
        message: "Bạn không có quyền truy cập vào danh sách này.",
      });
    }

    // Kiểm tra nếu không có nhân viên nào
    if (!staffAccounts || staffAccounts.length === 0) {
      return res
        .status(404)
        .json({ message: "Không có nhân viên nào được tìm thấy." });
    }

    // Phân loại nhân viên và cộng tác viên
    const employees = staffAccounts.filter(
      (staff) => staff.position === "Nhân viên"
    );
    const collaborators = staffAccounts.filter(
      (staff) => staff.position === "Cộng tác viên"
    );

    res.status(200).json({
      message: "Danh sách nhân viên đầy đủ thông tin.",
      total: staffAccounts.length,
      data: {
        employees,
        collaborators,
      },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Giá trị truy vấn không hợp lệ.",
        details: `Invalid ${error.path} value: ${error.value}`,
      });
    }
    console.error("Error in getFullStaffList:", error);
    res.status(500).json({
      message: "Có lỗi xảy ra trong hệ thống.",
      error: error.message,
    });
  }
};

// // Lấy thông tin chi tiết nhân viên
exports.getStaffById = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user;

    // Lấy thông tin tài khoản của người dùng hiện tại
    const currentUser = await Account.findById(userId).populate("role");

    if (!currentUser)
      return res.status(404).json({ message: "Tài khoản không tồn tại." });

    const {
      role: { name: userRole },
    } = currentUser;

    // Tìm nhân viên theo ID và populate thông tin account, role
    const staff = await StaffAccount.findById(id).populate({
      path: "account",
      select: "fullName email username avatar role",
      populate: { path: "role", select: "name" },
    });

    // Kiểm tra nếu không tìm thấy nhân viên
    if (!staff) {
      return res
        .status(404)
        .json({ error: "Không tìm thấy nhân viên với ID được cung cấp" });
    }

    // Kiểm tra quyền truy cập của Manager
    if (
      userRole === "Manager" &&
      staff.createdByManager.toString() !== userId
    ) {
      return res.status(403).json({
        message: "Bạn không có quyền truy cập vào thông tin của nhân viên này.",
      });
    }

    // Trả về thông tin chi tiết của nhân viên
    res.status(200).json({
      message: "Thông tin chi tiết nhân viên",
      data: staff,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        error: `Invalid ${error.path} value: ${error.value}`,
      });
    }
    res.status(500).json({
      error: "Có lỗi xảy ra trong hệ thống",
      details: error.message,
    });
  }
};

// // Cập nhật thông tin nhân viên
// Hàm cập nhật thông tin nhân viên
exports.updateStaff = async (req, res) => {
  try {
    const { id } = req.params; // Lấy id nhân viên từ params
    const {
      avatar,
      fullName,
      dateOfBirth,
      gender,
      email,
      phone,
      address,
      staffCode,
      position,
      joinDate,
      role: roleId,
      username,
      password,
    } = req.body;

    const userId = req.user.id;

    // Lấy thông tin tài khoản người dùng hiện tại
    const account = await Account.findById(userId).populate("role");

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    const isAdmin = account.role.name === "Admin";
    const isManager = account.role.name === "Manager";

    if (!isAdmin && !isManager) {
      return res
        .status(403)
        .json({ error: "Bạn không có quyền cập nhật thông tin nhân viên." });
    }

    // Tìm thông tin nhân viên theo id
    const staffAccount = await StaffAccount.findById(id).populate("account");

    if (!staffAccount) {
      return res.status(404).json({ error: "Nhân viên không tồn tại." });
    }

    // Nếu là Manager, kiểm tra quyền sở hữu nhân viên
    if (
      isManager &&
      staffAccount.createdByManager.toString() !== account._id.toString()
    ) {
      return res.status(403).json({
        error: "Bạn không có quyền cập nhật thông tin nhân viên này.",
      });
    }

    // Cập nhật thông tin nhân viên nếu có thay đổi
    if (avatar) staffAccount.avatar = avatar;
    if (fullName) staffAccount.fullName = fullName;
    if (dateOfBirth) staffAccount.dateOfBirth = dateOfBirth;
    if (gender) staffAccount.gender = gender;
    if (email) staffAccount.email = email;
    if (phone) staffAccount.phone = phone;
    if (address) staffAccount.address = address;
    if (staffCode) staffAccount.staffCode = staffCode;
    if (position) staffAccount.position = position;
    if (joinDate) staffAccount.joinDate = joinDate;

    // Chỉ Admin mới được phép cập nhật role
    if (isAdmin && roleId) {
      const roleExists = await Role.findById(roleId);
      if (!roleExists) {
        return res.status(404).json({ error: "Role không tồn tại." });
      }
      staffAccount.account.role = roleExists._id;
    }

    // Cập nhật username và password nếu có
    if (username) {
      staffAccount.account.username = username;
    }
    if (password) {
      // Mã hóa lại password trước khi lưu
      staffAccount.account.password = await bcrypt.hash(password, 10);
    }

    await staffAccount.save();
    await staffAccount.account.save(); // Lưu lại tài khoản nếu có thay đổi

    res.status(200).json({
      message: "Thông tin nhân viên đã được cập nhật thành công",
      staffAccount,
    });
  } catch (error) {
    res.status(500).json({
      message: "Có lỗi xảy ra khi cập nhật thông tin nhân viên",
      error: error.message,
    });
  }
};

// Hàm xóa nhân viên
exports.deleteStaff = async (req, res) => {
  try {
    const { id } = req.params; // ID của StaffAccount cần xóa
    const userId = req.user.id;

    // Lấy thông tin tài khoản hiện tại và vai trò
    const currentUser = await Account.findById(userId).populate("role");
    if (!currentUser) {
      return res.status(404).json({ message: "Tài khoản không tồn tại." });
    }

    const userRole = currentUser.role.name;

    // Lấy thông tin StaffAccount
    const staffAccount = await StaffAccount.findById(id).populate("account");
    if (!staffAccount) {
      return res.status(404).json({ message: "Nhân viên không tồn tại." });
    }

    // Kiểm tra quyền xóa
    if (
      userRole === "Manager" &&
      staffAccount.createdByManager.toString() !== userId
    ) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xóa nhân viên này." });
    }

    // Xóa cả Account và StaffAccount
    await Account.findByIdAndDelete(staffAccount.account._id);
    await StaffAccount.findByIdAndDelete(id);

    res.status(200).json({ message: "Xóa nhân viên thành công." });
  } catch (error) {
    console.error("Error in deleteStaff:", error);
    res.status(500).json({
      message: "Có lỗi xảy ra trong quá trình xóa nhân viên.",
      error: error.message,
    });
  }
};
