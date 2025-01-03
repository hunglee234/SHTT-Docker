const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const User = require("../models/User/User");
const Role = require("../models/Role");
const InfoUser = require("../models/User/InfoUser");
require("dotenv").config();
const SECRET_KEY = process.env.SECRET_KEY;
const bcrypt = require("bcrypt");
const sendMail = require("../controllers/email/emailController");

// Hàm tạo mật khẩu 6 chữ số ngẫu nhiên
function generatePassword() {
  return Math.floor(100000 + Math.random() * 900000);
}

// Sử dụng Google OAuth strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Kiểm tra xem người dùng có tồn tại trong MongoDB không, dựa vào email hoặc googleId.
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          const defaultRole = await Role.findOne({ name: "User" });
          const password = generatePassword();
          const hashedPassword = await bcrypt.hash(password.toString(), 10);

          user = new User({
            fullName: profile.displayName,
            email: profile.emails[0].value,
            username: profile.emails[0].value.split("@")[0], // Tạo tên người dùng từ email
            password: hashedPassword, // Gán mật khẩu ngẫu nhiên
            role: defaultRole._id, // Gán role mặc định
            provider: "google",
          });
          // Lưu người dùng vào MongoDB
          await user.save();
          console.log(user);
          const infoUser = new InfoUser({
            user: user._id,
            role: defaultRole._id,
            branch: "Cộng tác viên",
          });

          await infoUser.save();
          console.log(infoUser);

          // Gửi email với mật khẩu
          const emailSubject = "Chúc mừng bạn đã đăng ký thành công";
          const emailText = `Hello ${user.fullName},\n\nThank you for signing up!.
          \n\nYour account has been created successfully.\n\nLogin details: \n\n Email: ${user.email} 
          \n\nTemporary password: ${password}\n\nPlease log in and change your password as soon as possible.\n\nBest regards,\nYour App Team`;

          await sendMail(user.email, emailSubject, emailText);
        }

        // Tạo JWT token
        const token = jwt.sign(
          { id: user._id, email: user.email, fullName: user.fullName },
          SECRET_KEY,
          { expiresIn: "1h" }
        );
        console.log(token);
        // // Tạo token JWT
        // const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, {
        //   expiresIn: "1h",
        // });
        
        // Trả về token khi hoàn tất xác thực
        return done(null, token);
      } catch (err) {
        console.error("Error saving user:", err);
        return done(err, null);
      }
    }
  )
);
