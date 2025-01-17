const axios = require("axios");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Account = require("../../models/Account/Account");
const InfoAccount = require("../../models/Account/InfoStaff");
const Role = require("../../models/Role");
const { saveAvatar } = require("../../utils/saveAvatar");
require("dotenv").config();
const { OAuth2Client } = require("google-auth-library");
const client_id = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(client_id);
const SECRET_KEY = "hungdzvclra";

// const sendMail = require("../../controllers/email/emailController");

async function verifyToken(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: client_id,
  });
  const payload = ticket.getPayload();
  return payload;
}

// Hàm tạo mật khẩu 6 chữ số ngẫu nhiên
function generatePassword() {
  const password = Math.floor(100000 + Math.random() * 900000);
  return password.toString();
}

// Hàm để bắt đầu quá trình xác thực với Google
exports.handleCallback = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const payload = await verifyToken(token); // Hàm verifyToken bạn cần tự định nghĩa
    const { email, name, picture } = payload;

    let avatarId = null;
    if (picture) {
      avatarId = await saveAvatar(picture);
    }

    const username = email.split("@")[0];
    // Kiểm tra tài khoản đã tồn tại
    let account = await Account.findOne({ email }).populate("role");

    if (account) {
      // Nếu tài khoản đã tồn tại, tạo token mới
      const tokenSignIn = jwt.sign(
        { id: account._id, role: account.role.name || account.role },
        SECRET_KEY,
        { expiresIn: "1h" }
      );
      // console.log("a", tokenSignIn);
      // Cập nhật token
      account.token = tokenSignIn;
      await account.save();
      
      return res.status(200).json({
        message: "Đăng nhập Google thành công",
        data: {
          id: account._id,
          fullName: account.fullName,
          username: account.username,
          email: account.email,
          avatar: account.avatar || picture,
          role: account.role.name,
          token: tokenSignIn,
        },
      });
    }

    // Nếu tài khoản chưa tồn tại, tạo mới
    const defaultRole = await Role.findOne({ name: "Manager" });
    const password = generatePassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo tài khoản mới
    account = new Account({
      fullName: name,
      username,
      email,
      password: hashedPassword,
      role: defaultRole._id,
      provider: "google",
    });
    const savedAccount = await account.save();

    // Tạo thông tin chi tiết tài khoản
    const infoAccount = new InfoAccount({
      account: savedAccount._id,
      avatar: avatarId,
    });
    const savedInfoAccount = await infoAccount.save();

    const accountWithAvatar = await InfoAccount.findById(
      savedInfoAccount._id
    ).populate({
      path: "avatar",
      select: "url",
    });

    const avatarUrl = accountWithAvatar.avatar?.url || null;
    // Gửi email với mật khẩu
    // const emailSubject = "Chúc mừng bạn đã đăng ký thành công";
    // const emailText = `Hello ${account.fullName},\n\nThank you for signing up!.
    //   \n\nYour account has been created successfully.\n\nLogin details: \n\n Email: ${account.email}
    //   \n\nTemporary password: ${password}\n\nPlease log in and change your password as soon as possible.\n\nBest regards,\nYour App Team`;

    // await sendMail(account.email, emailSubject, emailText);

    const tokenSignIn = jwt.sign(
      { id: savedAccount._id, role: defaultRole.name || defaultRole._id },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    // Lưu token vào tài khoản
    savedAccount.token = tokenSignIn;
    await savedAccount.save();

    // Chuẩn bị dữ liệu trả về
    const responseData = {
      id: savedAccount._id,
      avatar: avatarUrl,
      fullName: savedAccount.fullName,
      username: savedAccount.username,
      email: savedAccount.email,
      password: savedAccount.password,
      role: savedAccount.role,
      provider: savedAccount.provider,
      token: tokenSignIn,
    };

    // Gửi phản hồi thành công
    return res.status(201).json({
      message: "Tài khoản Google đã được lưu thành công",
      data: responseData,
    });
  } catch (error) {
    console.error("Error in handleCallback:", error);

    // Gửi phản hồi lỗi
    return res.status(500).json({
      message: "Có lỗi xảy ra khi xử lý tài khoản Google",
      error: error.message,
    });
  }
};
