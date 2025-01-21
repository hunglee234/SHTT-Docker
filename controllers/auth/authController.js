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

exports.login2 = async (req, res) => {
  const { identifier, password } = req.body; // `identifier` là MST hoặc SDT
  try {
    // Tìm MST hoặc SDT trong InfoAccount
    if (/^(0[3|5|7|8|9])+([0-9]{8})$/.test(identifier)) {
      accountInfo = await StaffAccount.findOne({ phone: identifier }).populate(
        "account"
      );
    } else if (/^\d{10,13}$/.test(identifier)) {
      // Nếu là MST (10-13 chữ số)
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
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    account.token = token;
    await account.save();

    // Trả về token và thông tin người dùng
    return res.json({
      message: "Login successful",
      token,
      account: {
        id: account._id,
        identifier,
        role: roleAccount.role.name || roleAccount.role,
        phone: accountInfo.phone || null,
        MST: accountInfo.MST || null,
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
      const existingPhone = await StaffAccount.findOne({ phone });
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
