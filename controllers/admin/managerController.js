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
      fullName,
      email,
      password,
      username,
      role,
      position,
      dateOfBirth,
      gender,
      phone,
      address,
      createdByManager,
    } = req.body;
    // Lấy thời gian joinDate theo múi giờ Việt Nam
    const joinDate = moment.tz("Asia/Ho_Chi_Minh").format();

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tìm Role bằng tên (string) và lấy ObjectId
    const roleExists = await Role.findOne({ name: role });
    if (!roleExists) {
      return res.status(400).json({ error: "Role not found" });
    }

    const roleId = roleExists._id; // Lấy ObjectId của role

    // Tạo tài khoản mới trong collection Account
    const newAccount = new Account({
      fullName,
      email,
      password: hashedPassword,
      username,
      role: roleId,
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
      createdByManager,
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
    // Lấy tất cả các tài khoản trong StaffAccount và populate thông tin account, role
    const staffAccounts = await StaffAccount.find().populate({
      path: "account",
      populate: { path: "role" }, // Populate thông tin role trong account
    });

    // Kiểm tra nếu không có nhân viên nào
    if (!staffAccounts || staffAccounts.length === 0) {
      return res
        .status(404)
        .json({ error: "Không có nhân viên nào được tìm thấy" });
    }

    // Trả về danh sách nhân viên đầy đủ thông tin
    res.status(200).json({
      message: "Danh sách nhân viên đầy đủ thông tin",
      data: staffAccounts,
    });
  } catch (error) {
    // Bắt lỗi nếu có vấn đề trong quá trình truy vấn
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

// // Lấy thông tin chi tiết nhân viên
exports.getStaffById = async (req, res) => {
  try {
    // Lấy ID từ params
    const { id } = req.params;

    // Tìm nhân viên theo ID và populate thông tin account, role
    const staff = await StaffAccount.findById(id).populate({
      path: "account",
      populate: { path: "role" }, // Populate thông tin role trong account
    });

    // Kiểm tra nếu không tìm thấy nhân viên
    if (!staff) {
      return res
        .status(404)
        .json({ error: "Không tìm thấy nhân viên với ID được cung cấp" });
    }

    // Trả về thông tin chi tiết của nhân viên
    res.status(200).json({
      message: "Thông tin chi tiết nhân viên",
      data: staff,
    });
  } catch (error) {
    // Bắt lỗi nếu có vấn đề trong quá trình truy vấn
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
exports.updateStaffInfo = async (req, res) => {
  try {
    const { id: accountId } = req.params;
    console.log("Received accountId:", accountId);

    // Kiểm tra tính hợp lệ của accountId
    if (!mongoose.Types.ObjectId.isValid(accountId)) {
      console.log("Invalid accountId format");
      return res.status(400).json({ error: "Invalid accountId format" });
    }

    const {
      username,
      email,
      password,
      fullName,
      dateOfBirth,
      gender,
      phone,
      address,
      avatar,
      status,
      position,
    } = req.body;

    // Đầu vào của Role là String

    const roleName = req.body.role;

    const role = await Role.findOne({
      name: roleName,
    });

    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    console.log("Received request body:", req.body);

    // Mã hóa mật khẩu nếu có
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
      console.log("Password hashed successfully");
    }

    // Cập nhật thông tin trong Account
    console.log("Updating Account with accountId:", accountId);
    const updatedAccount = await Account.findByIdAndUpdate(
      accountId,
      {
        ...(username && { username }),
        ...(email && { email }),
        ...(password && { password: hashedPassword }),
        ...(fullName && { fullName }),
        ...(role && { role }),
      },
      { new: true }
    );

    if (!updatedAccount) {
      console.log("Account not found");
      return res.status(404).json({ error: "Account not found" });
    }

    console.log("Updated Account:", updatedAccount);

    // Cập nhật thông tin trong InfoStaff
    console.log("Updating InfoStaff for accountId:", accountId);
    const updatedInfoStaff = await StaffAccount.findOneAndUpdate(
      { account: accountId },
      {
        ...(dateOfBirth && { dateOfBirth }),
        ...(gender && { gender }),
        ...(phone && { phone }),
        ...(address && { address }),
        ...(avatar && { avatar }),
        ...(status && { status }),
        ...(position && { position }),
      },
      { new: true } // Trả về bản ghi mới sau khi cập nhật
    );

    if (!updatedInfoStaff) {
      console.log("InfoStaff not found");
      return res.status(404).json({ error: "InfoStaff not found" });
    }

    console.log("Updated InfoStaff:", updatedInfoStaff);

    // Populate dữ liệu trả về
    console.log("Populating updated data for response");
    const populatedAccount = await Account.findById(accountId).populate("role");
    const populatedInfoStaff = await StaffAccount.findOne({
      account: accountId,
    });

    console.log("Populated Account:", populatedAccount);
    console.log("Populated InfoStaff:", populatedInfoStaff);

    // Trả về kết quả
    res.status(200).json({
      account: populatedAccount,
      StaffAccount: populatedInfoStaff,
    });
  } catch (err) {
    console.error("Error occurred:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Hàm xóa nhân viên
exports.deleteStaff = async (req, res) => {
  try {
    const { accountId } = req.params;
    // Xóa InfoStaff trước
    const deletedInfoStaff = await StaffAccount.findOneAndDelete({
      account: accountId,
    });
    if (!deletedInfoStaff) {
      return res.status(404).json({ error: "InfoStaff not found" });
    }

    // Xóa Account sau
    const deletedAccount = await Account.findByIdAndDelete(accountId);
    if (!deletedAccount) {
      return res.status(404).json({ error: "Account not found" });
    }
    res.status(200).json({ message: "Staff and Account deleted successfully" });
  } catch (err) {
    console.error("Error occurred:", err); // Kiểm tra lỗi nếu có
    res.status(500).json({ error: err.message });
  }
};
