const axios = require("axios");
const bcrypt = require("bcrypt");
const User = require("../../models/User/User");
const InfoUser = require("../../models/User/InfoUser");
const Role = require("../../models/Role");
require("dotenv").config();
const { OAuth2Client } = require("google-auth-library");
const client_id = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(client_id);

async function verifyToken(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: client_id,
  });
  const payload = ticket.getPayload();
  // xử lý payload, vd: lưu thông tin người dùng vào database
  return payload;
}

// Hàm để bắt đầu quá trình xác thực với Google
exports.googleLogin = async (req, res) => {
  const { token } = req.body;
  const payload = await verifyToken(token);

  const { email, name, sub } = payload;
  let user = await User.findOne({ email, googleId: sub });
  if (!user) {
    const defaultRole = await Role.findOne({ name: "Manager" });
    const password = "123123";
    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({
      fullName: name,
      username: email,
      email,
      googleId: sub,
      password: hashedPassword,
      role: defaultRole._id,
      provider: "google",
    });
    await user.save();
    console.log(user);
    const infoUser = new InfoUser({
      user: user._id,
      role: defaultRole._id,
      branch: "Quản lý",
    });
    await infoUser.save();
    console.log(infoUser);
  }

  return res.status(200).json(user);
};
