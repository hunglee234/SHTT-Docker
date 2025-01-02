const axios = require("axios");
const jwt = require("jsonwebtoken");
const User = require("../../models/User/User");
const InfoUser = require("../../models/User/InfoUser");
const Role = require("../../models/Role");
const bcrypt = require("bcrypt");
const sendMail = require("../../controllers/email/emailController");

function generatePassword() {
  return Math.floor(100000 + Math.random() * 900000);
}

exports.facebookLogin = (req, res) => {
  const redirectUri = "https://www.facebook.com/v16.0/dialog/oauth"; // Địa chỉ yêu cầu đăng nhập Facebook
  const { FACEBOOK_APP_ID, FACEBOOK_CALLBACK_URL } = process.env;

  if (!FACEBOOK_APP_ID || !FACEBOOK_CALLBACK_URL) {
    return res
      .status(400)
      .send("Facebook App ID hoặc Callback URL không được cấu hình.");
  }

  console.log("Redirecting to Facebook Login...");

  // Tạo URL đăng nhập Facebook với các tham số cần thiết
  const loginUrl = `${redirectUri}?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(
    FACEBOOK_CALLBACK_URL
  )}&scope=email,public_profile`;

  console.log("Redirecting to: ", loginUrl);

  // Chuyển hướng người dùng đến Facebook Login
  res.redirect(loginUrl);
};

exports.facebookCallback = async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).json({ error: "Code is required" });
  }
  try {
    // Trao đổi mã để lấy access token
    const tokenResponse = await axios.get(
      "https://graph.facebook.com/v16.0/oauth/access_token",
      {
        params: {
          client_id: process.env.FACEBOOK_APP_ID,
          client_secret: process.env.FACEBOOK_APP_SECRET,
          redirect_uri: process.env.FACEBOOK_CALLBACK_URL,
          code,
        },
      }
    );
    const accessToken = tokenResponse.data.access_token;

    // Lấy thông tin người dùng từ Facebook bằng access token
    const userResponse = await axios.get("https://graph.facebook.com/me", {
      params: {
        access_token: accessToken,
        fields: "id,name,email",
      },
    });
    // const user = userResponse.data;
    const { id: facebookId, name, email } = userResponse.data;

    // Kiểm tra người dùng đã tồn tại trong database chưa
    let user = await User.findOne({ email });

    if (!user) {
      const defaultRole = await Role.findOne({ name: "User" });
      const password = generatePassword();
      const hashedPassword = await bcrypt.hash(password.toString(), 10);

      user = new User({
        fullName: name,
        email,
        username: email.split("@")[0],
        password: hashedPassword,
        role: defaultRole._id,
        provider: "facebook",
      });
      await user.save();
      console.log(user);
      // Lưu thông tin bổ sung
      const infoUser = new InfoUser({
        user: user._id,
        role: defaultRole._id,
        branch: "Cộng tác viên",
      });

      await infoUser.save();
      console.log(infoUser);
      // Gửi email thông báo
      const emailSubject = "Chúc mừng bạn đã đăng ký thành công";
      const emailText = `Chào ${user.fullName},\n\n
      Cảm ơn bạn đã đăng ký tài khoản! \n\n
      Thông tin đăng nhập:\n\n
      Email: ${user.email}\n
      Mật khẩu tạm thời: ${password}\n\n
      Vui lòng đăng nhập và thay đổi mật khẩu của bạn ngay khi có thể.\n\n
      Trân trọng,\nĐội ngũ hỗ trợ của chúng tôi.`;

      await sendMail(user.email, emailSubject, emailText);
    }
    // Tạo JWT cho người dùng
    const token = jwt.sign(
      { id: user.id, fullName: user.fullName, email: user.email },
      process.env.SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );
    // Lưu provider vào user ( google)
    console.log(token);
    // Lưu token vào cookie hoặc gửi về client
    res.cookie("jwt", token, { httpOnly: true });

    // Chuyển hướng về trang chủ hoặc bất kỳ trang nào bạn muốn
    res.redirect("https://www.youtube.com/watch?v=aPqAwGG7NYQ&t=1012s");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to log in with Facebook" });
  }
};
