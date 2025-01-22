const mongoose = require("mongoose");
const Account = require("../models/Account/Account");
const InfoAccount = require("../models/Account/InfoStaff");
const Role = require("../models/Role");
const bcrypt = require("bcrypt");

const seeDatabase = async () => {
  try {
    // Kết nối MongoDB
    let resultHung = await mongoose.connect(
      "mongodb+srv://hung:hung@cluster0.vyvn6.mongodb.net/users234?retryWrites=true&w=majority&appName=Cluster0",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log(resultHung.connections[0].name);
    console.log("Kết nối MongoDB thành công");

    // Tìm role Admin
    const adminRole = await Role.findOne({ name: "Admin" });

    // Mã hóa mật khẩu
    const adminPassword = await bcrypt.hash("admin123", 10);

    // Tạo tài khoản admin
    const account = [
      {
        fullName: "Admin",
        email: "admin1@example.com",
        password: adminPassword,
        role: adminRole._id, // Lưu _id của role Admin
      },
    ];

    // Thêm tài khoản admin vào database
    const savedAccount = await Account.insertMany(account);
    console.log("Account added:", savedAccount);

    // Tạo tài liệu InfoAccount cho Admin
    const infoAccounts = savedAccount.map((account) => ({
      account: account._id, // Liên kết với _id trong bảng Account
      phone: "0969623498",
    }));

    // Thêm tài liệu InfoAccount vào database
    await InfoAccount.insertMany(infoAccounts);
    console.log("InfoAccount added:", infoAccounts);

    console.log("Database đã được thêm thành công");
    process.exit(0);
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  }
};

seeDatabase();
