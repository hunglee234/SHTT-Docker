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
    // console.log(userId);
    // Lấy thông tin tài khoản hiện tại
    const account = await Account.findById(userId).populate("role");

    if (!account) {
      return res.status(404).json({ error: "Tài khoản không tồn tại." });
    }

    console.log("b", account._id);
    const accountWithAvatar = await StaffAccount.findById(account._id);

    console.log(accountWithAvatar);
    try {
      const accountWithAvatar = await StaffAccount.findById(userId);
      if (!accountWithAvatar) {
        console.log("Không tìm thấy tài khoản trong StaffAccount");
      } else {
        console.log("accountWithAvatar", accountWithAvatar);
      }
    } catch (error) {
      console.error("Lỗi khi truy vấn StaffAccount:", error);
    }
    let avatarUrl = null;
    // Kiểm tra avatar trong StaffAccount
    const accountWithAvatar = await StaffAccount.findById(account._id);
    console.log("a", accountWithAvatar);

    if (accountWithAvatar.avatar?.url) {
      avatarUrl = accountWithAvatar.avatar.url;
      console.log("b", avatarUrl); // Nếu có avatar, lấy URL
    } else {
      // Nếu không có avatar trong StaffAccount, kiểm tra trong ManagerAccount
      const accountInManager = await ManagerAccount.findById(
        account._id
      ).populate({
        path: "avatar",
        select: "url", // Chỉ lấy trường url trong Avatar
      });

      avatarUrl = accountInManager?.avatar?.url || null; // Nếu có avatar trong ManagerAccount, lấy URL
    }

    // Định dạng dữ liệu trả về
    const responseData = {
      avatar: avatarUrl, // Lấy URL avatar đã xác định
      fullName: account.fullName,
      dateOfBirth: account.dateOfBirth,
      gender: account.gender,
      email: account.email,
      phone: account.phone,
      address: account.address,
      username: account.username,
      role: account.role,
    };
  } catch (error) {
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
      fullName,
      dateOfBirth,
      gender,
      email,
      phone,
      address,
      username,
      password,
    } = req.body;

    // Kiểm tra avatar nếu có
    let avatarId = null;
    if (req.file) {
      const avatarUrl = req.file.location;
      avatarId = await saveAvatar(avatarUrl);
    }

    // Chuyển đổi chuỗi ngày tháng từ định dạng DD/MM/YYYY thành đối tượng Date
    const parsedDateOfBirth = dayjs(dateOfBirth, "DD/MM/YYYY").isValid()
      ? dayjs(dateOfBirth, "DD/MM/YYYY").toDate()
      : null;

    // Lấy thông tin tài khoản hiện tại
    const account = await Account.findById(userId);

    if (!account) {
      return res.status(404).json({ error: "Tài khoản không tồn tại." });
    }

    // Cập nhật thông tin tài khoản
    if (fullName) account.fullName = fullName;
    if (email) account.email = email;
    if (phone) account.phone = phone;
    if (address) account.address = address;
    if (dateOfBirth) account.dateOfBirth = parsedDateOfBirth;
    if (gender) account.gender = gender;

    // Cập nhật avatar nếu có
    if (avatarId) {
      account.avatar = avatarId;
    }

    // Cập nhật username và password nếu có
    if (username) account.username = username;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      account.password = hashedPassword; // Mã hóa mật khẩu
    }

    // Lưu thông tin tài khoản
    await account.save();

    // Trả về thông tin tài khoản đã cập nhật
    const updatedAccount = await Account.findById(userId).populate({
      path: "avatar",
      select: "url",
    });

    const responseData = {
      avatar: updatedAccount.avatar?.url || null,
      fullName: updatedAccount.fullName,
      dateOfBirth: updatedAccount.dateOfBirth,
      gender: updatedAccount.gender,
      email: updatedAccount.email,
      phone: updatedAccount.phone,
      address: updatedAccount.address,
      username: updatedAccount.username,
      role: updatedAccount.role,
    };

    res.status(200).json({
      message: "Thông tin tài khoản đã được cập nhật thành công",
      data: responseData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Có lỗi xảy ra khi cập nhật thông tin tài khoản",
      error: error.message,
    });
  }
};
