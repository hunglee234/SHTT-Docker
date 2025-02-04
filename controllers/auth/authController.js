const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Role = require("../../models/Role");
const Account = require("../../models/Account/Account");
const StaffAccount = require("../../models/Account/InfoStaff");
require("dotenv").config();
const sendMail = require("../../controllers/email/emailController");
const crypto = require("crypto");
require("dotenv").config();

exports.login2 = async (req, res) => {
  const { identifier, password } = req.body; // `identifier` là MST hoặc SDT
  try {
    let accountInfo = null;
    // Tìm MST hoặc SDT trong InfoAccount
    if (/^(0[3|5|7|8|9])+([0-9]{8})$/.test(identifier)) {
      accountInfo = await StaffAccount.findOne({ phone: identifier }).populate(
        "account"
      );
    } else {
      accountInfo = await StaffAccount.findOne({ MST: identifier }).populate(
        "account"
      );
    }

    // Kiểm tra nếu không tìm thấy tài khoản
    if (!accountInfo || !accountInfo.account) {
      return res
        .status(404)
        .json({ message: "Account not found. Please check your identifier." });
    }

    // Truy cập vào bảng Account thông qua khóa ngoại
    const account = accountInfo.account;
    const roleAccount = await Account.findOne({ _id: account._id }).populate(
      "role"
    );

    // Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(password, account.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Tạo token JWT
    const token = jwt.sign(
      {
        id: account._id,
        role: roleAccount.role.name || roleAccount.role,
      },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    account.token = token;
    await account.save();

    const accountWithAvatar = await StaffAccount.findOne({
      account: account._id,
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
      account: {
        id: account._id,
        avatar: avatarUrl,
        fullName: account.fullName || null,
        companyName: accountInfo.companyName || null,
        username: account.username,
        identifier,
        role: roleAccount.role.name || roleAccount.role,
        phone: accountInfo.phone || null,
        MST: accountInfo.MST || null,
        typeAccount: account.typeaccount,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.register = async (req, res) => {
  const { type } = req.body;

  try {
    if (type === "individual") {
      // Đăng ký tài khoản cá nhân
      const { fullName, phoneNumber, email, password } = req.body;

      // Kiểm tra các trường bắt buộc
      if (!fullName || !phoneNumber || !email || !password) {
        return res.status(400).json({
          message:
            "Full name, phone number, and password are required for individual registration",
        });
      }

      const existingEmail = await Account.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      // Kiểm tra xem số điện thoại đã tồn tại chưa
      const existingPhone = await StaffAccount.findOne({ phone: phoneNumber });
      if (existingPhone) {
        return res.status(400).json({ message: "Phone number already exists" });
      }

      // Tìm vai trò mặc định "Manager"
      const roleAccount = await Role.findOne({ name: "Manager" });
      if (!roleAccount) {
        return res
          .status(500)
          .json({ message: "Default role 'Manager' not found" });
      }

      // Mã hóa mật khẩu
      const hashedPassword = await bcrypt.hash(password, 10);

      // Tạo tài khoản cá nhân
      const newAccount = new Account({
        fullName,
        email,
        password: hashedPassword,
        typeaccount: type,
        role: roleAccount._id,
      });

      const savedAccount = await newAccount.save();

      const newInfoAccount = new StaffAccount({
        account: savedAccount._id,
        phone: phoneNumber,
      });

      const savedInfoStaff = await newInfoAccount.save();

      // Phản hồi thành công
      return res.status(201).json({
        message: "Khách hàng cá nhân đăng ký thành công",
        Account: savedAccount,
        infoAccount: savedInfoStaff,
      });
    } else if (type === "company") {
      // Đăng ký tài khoản công ty
      const { companyName, taxCode, email, password } = req.body;

      // Kiểm tra các trường bắt buộc
      if (!companyName || !taxCode || !email || !password) {
        return res.status(400).json({
          message:
            "Company name, tax code, and password are required for company registration",
        });
      }

      // Kiểm tra mã số thuế đã tồn tại chưa
      const existingTaxcode = await StaffAccount.findOne({ MST: taxCode });
      if (existingTaxcode) {
        return res.status(400).json({ message: "Tax code already exists" });
      }

      const existingEmail = await Account.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Tìm vai trò mặc định "Manager"
      const roleAccount = await Role.findOne({ name: "Manager" });
      if (!roleAccount) {
        return res
          .status(500)
          .json({ message: "Default role 'Manager' not found" });
      }

      // Mã hóa mật khẩu
      const hashedPassword = await bcrypt.hash(password, 10);

      // Tạo tài khoản công ty
      const newAccount = new Account({
        email,
        password: hashedPassword,
        typeaccount: type,
        role: roleAccount._id,
      });

      const savedAccount = await newAccount.save();

      const newInfoAccount = new StaffAccount({
        account: savedAccount._id,
        MST: taxCode,
        companyName,
      });

      const savedInfoStaff = await newInfoAccount.save();

      // Phản hồi thành công
      return res.status(201).json({
        message: "Khách hàng doanh nghiệp đăng ký thành công",
        Account: savedAccount,
        infoAccount: savedInfoStaff,
      });
    } else {
      return res.status(400).json({ message: "Invalid account type" });
    }
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

// Quên mật khẩu

exports.forgotpassword = async (req, res) => {
  try {
    const { email } = req.body;
    const account = await Account.findOne({ email });
    if (!account)
      return res.status(400).json({ message: "Email không tồn tại!" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    account.resetCode = hashedOtp;
    account.resetCodeExpire = Date.now() + 10 * 60 * 1000;
    await account.save();

    // Gửi email chứa OTP
    const emailSubject = "Mã xác thực quên mật khẩu";
    const emailText = `Mã xác thực của bạn là: ${otp}`;
    try {
      await sendMail(account.email, emailSubject, emailText);
      res.json({ message: "Mã xác thực đã được gửi đến email." });
    } catch (error) {
      console.error("Lỗi gửi email:", error);
      res.status(500).json({ message: "Lỗi khi gửi email, vui lòng thử lại!" });
    }
  } catch (error) {
    console.error("Lỗi xử lý quên mật khẩu:", error);
    res
      .status(500)
      .json({ message: "Đã có lỗi xảy ra, vui lòng thử lại sau!" });
  }
};

// Xác nhận mã code
exports.verifycode = async (req, res) => {
  try {
    const { email, code } = req.body;
    const account = await Account.findOne({ email });

    if (!account)
      return res.status(400).json({ message: "Email không tồn tại!" });

    // Mã hóa mã code người dùng nhập vào để kiểm tra
    const hashedCode = crypto.createHash("sha256").update(code).digest("hex");

    if (
      account.resetCode !== hashedCode ||
      account.resetCodeExpire < Date.now()
    ) {
      return res
        .status(400)
        .json({ message: "Mã xác thực không hợp lệ hoặc đã hết hạn!" });
    }

    // Tạo token cho bước đặt lại mật khẩu
    const token = jwt.sign({ id: account._id }, process.env.SECRET_KEY, {
      expiresIn: "15m",
    });

    res.json({ message: "Xác thực thành công!", token });
  } catch (error) {
    console.error("Lỗi xử lý xác thực mã:", error);
    res
      .status(500)
      .json({ message: "Đã có lỗi xảy ra, vui lòng thử lại sau!" });
  }
};

// Đặt lại mật khẩu
exports.resetpassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    let accountInfo = null;
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const account = await Account.findById(decoded.id);
    if (!account)
      return res.status(400).json({ message: "Người dùng không tồn tại!" });

    accountInfo = await StaffAccount.findOne({ account: account._id }).populate(
      "account"
    );
    // Cập nhật mật khẩu mới
    account.password = await bcrypt.hash(newPassword, 10);
    account.resetCode = undefined;
    account.resetCodeExpire = undefined;
    await account.save();

    res.json({
      message: "Mật khẩu đã được cập nhật!",
      account: {
        identifier: accountInfo.phone || accountInfo.MST || null,
      },
    });
  } catch (error) {
    console.error("Lỗi đặt lại mật khẩu:", error);
    res.status(400).json({ message: "Token không hợp lệ hoặc đã hết hạn!" });
  }
};
