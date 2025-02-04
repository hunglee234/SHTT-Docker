const express = require("express");
const User = require("../../models/User/User");
const bcrypt = require("bcrypt");
const { saveAvatar } = require("../../utils/saveAvatar");
const Account = require("../../models/Account/Account");
const StaffAccount = require("../../models/Account/InfoStaff");
const ManagerAccount = require("../../models/Account/InfoManager");
const Role = require("../../models/Role");
const moment = require("moment-timezone");
const mongoose = require("mongoose");
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);

exports.getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    // Lấy thông tin tài khoản hiện tại
    const account = await Account.findById(userId).populate("role");
    if (!account) {
      return res.status(404).json({ error: "Tài khoản không tồn tại." });
    }

    const staff = await StaffAccount.findOne({ account: account._id }).populate(
      [{ path: "account" }, { path: "avatar", select: "url" }]
    );

    // Kiểm tra nếu không tìm thấy nhân viên
    if (!staff) {
      return res
        .status(404)
        .json({ error: "Không tìm thấy nhân viên với ID được cung cấp" });
    }

    // Định dạng dữ liệu trả về
    const responseData = {
      avatar: staff.avatar ? staff.avatar.url : "",
      password: staff.account.password,
      fullName: staff.account.fullName,
      email: staff.account.email,
      username: staff.account.username,
      role: staff.account.role,
      phone: staff.phone,
      address: staff.address,
      staffCode: staff.staffCode,
      joinDate: staff.createdAt,
      gender: staff.gender,
    };
    // Trả về dữ liệu cho client
    res.status(200).json(responseData);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin tài khoản:", error);
    res.status(500).json({
      message: "Có lỗi xảy ra khi lấy thông tin tài khoản",
      error: error.message,
    });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      website,
      companyName,
      joinDate,
      gender,
      fullName,
      email,
      phone,
      dateOfBirth,
      address,
      username,
      password,
    } = req.body;

    // Kiểm tra avatar nếu có file được tải lên
    let avatarId = null;
    if (req.file) {
      const avatarUrl = req.file.location;
      avatarId = await saveAvatar(avatarUrl);
    }

    // Lấy thông tin tài khoản của người dùng hiện tại
    const account = await Account.findById(userId).populate("role");
    if (!account) {
      return res.status(404).json({ error: "Tài khoản không tồn tại." });
    }

    // Tìm thông tin liên quan từ StaffAccount
    const staffAccount = await StaffAccount.findOne({ account: account._id })
      .populate({
        path: "account",
        select: "fullName email username avatar role password",
        populate: { path: "role", select: "name" },
      })
      .populate({
        path: "avatar", // Populate thông tin avatar
        select: "url", // Lấy chỉ trường url của avatar
      });

    // Kiểm tra xem số điện thoại đã tồn tại chưa
    if (phone && phone !== staffAccount.phone) {
      const existingPhone = await StaffAccount.findOne({ phone });
      if (existingPhone) {
        return res.status(400).json({ message: "Phone number already exists" });
      }
      staffAccount.phone = phone;
    }

    if (email && email !== staffAccount.account.email) {
      const existingEmail = await Account.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({
          message: "Email đã tồn tại!",
        });
      }
      staffAccount.account.email = email;
    }

    // Kiểm tra username có tồn tại không
    if (username && username !== staffAccount.account.username) {
      const existingUsername = await Account.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({
          message: "Username đã tồn tại!",
        });
      }
      staffAccount.account.username = username;
    }

    // Chuyển đổi chuỗi ngày tháng từ định dạng DD/MM/YYYY thành đối tượng Date
    const parsedDateOfBirth = dayjs(dateOfBirth, "DD/MM/YYYY").isValid()
      ? dayjs(dateOfBirth, "DD/MM/YYYY").toDate()
      : null;
    const parsedJoinDate = dayjs(joinDate, "DD/MM/YYYY").isValid()
      ? dayjs(joinDate, "DD/MM/YYYY").toDate()
      : null;

    // Cập nhật các thông tin của tài khoản
    if (fullName) account.fullName = fullName;
    // Cập nhật avatar nếu có
    if (avatarId) {
      staffAccount.avatar = avatarId;
    }
    // website,
    //   companyName

    // Cập nhật các thông tin từ StaffAccount
    if (website) staffAccount.website = website;
    if (companyName) staffAccount.companyName = companyName;
    if (address) staffAccount.address = address;
    if (dateOfBirth) {
      staffAccount.dateOfBirth = parsedDateOfBirth;
    }
    if (joinDate) {
      staffAccount.joinDate = parsedJoinDate;
    }
    if (gender) staffAccount.gender = gender;

    // Cập nhật mật khẩu nếu có
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      account.password = hashedPassword;
    }

    // Lưu thông tin cập nhật
    await account.save();
    await staffAccount.save();

    // Lấy thông tin đã cập nhật để trả về
    const updatedStaffAccount = await StaffAccount.findOne({ account: userId })
      .populate({
        path: "account",
        select: "fullName email username role password",
        populate: { path: "role", select: "name" },
      })
      .populate({
        path: "avatar",
        select: "url",
      });

    const responseData = {
      id: updatedStaffAccount._id,
      website: updatedStaffAccount.website,
      companyName: updatedStaffAccount.companyName,
      avatar: updatedStaffAccount.avatar?.url || null,
      password: updatedStaffAccount.account.password,
      fullName: updatedStaffAccount.account.fullName,
      dateOfBirth: updatedStaffAccount.dateOfBirth,
      joinDate: updatedStaffAccount.joinDate,
      gender: updatedStaffAccount.gender,
      email: updatedStaffAccount.account.email,
      phone: updatedStaffAccount.phone,
      address: updatedStaffAccount.address,
      username: updatedStaffAccount.account.username,
      staffCode: updatedStaffAccount.staffCode,
      role: updatedStaffAccount.account.role,
    };

    res.status(200).json({
      message: "Thông tin tài khoản đã được cập nhật thành công",
      data: responseData,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật tài khoản:", error);
    res.status(500).json({
      message: "Có lỗi xảy ra khi cập nhật thông tin tài khoản",
      error: error.message,
    });
  }
};
