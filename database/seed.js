const mongoose = require("mongoose");
const Account = require("../models/Account/Account");
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
    console.log(resultHung.connections[0].name); //
    console.log("Kết nối mongoDB thành công");

    // Tạo người dùng vói các role, sử dụng _id của role
    const adminRole = await Role.findOne({ name: "Admin" });
    console.log(adminRole);

    const managerRole = await Role.findOne({ name: "Manager" });
    console.log(managerRole);

    const adminPassword = await bcrypt.hash("admin123", 10);
    const managerPassword = await bcrypt.hash("manager123", 10);

    const account = [
      {
        fullName: "Admin User",
        email: "admin2345@example.com",
        password: adminPassword,
        role: adminRole._id,
      }, // Lưu _id của role
      {
        fullName: "Manager User",
        email: "manager2345@example.com",
        password: managerPassword,
        role: managerRole._id,
      }, // Lưu _id của role
    ];

    await Account.insertMany(account);
    console.log("Account added");

    console.log("Database đã được thêm thành công");
    process.exit(0);
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  }
};

seeDatabase();
