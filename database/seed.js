const mongoose = require("mongoose");
const User = require("../models/User");
const Role = require("../models/Role");
const bcrypt = require("bcrypt");

const seeDatabase = async () => {
  try {
    // Kết nối MongoDB
    let resultHung = await mongoose.connect(
      "mongodb+srv://hung:hung@cluster0.vyvn6.mongodb.net/hung132?retryWrites=true&w=majority&appName=Cluster0",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log(resultHung.connections[0].name); //
    console.log("Kết nối mongoDB thành công");

    // Xóa dữ liệu cũ
    await User.deleteMany({});
    await Role.deleteMany({});

    // Tạo các Role
    const roles = [
      { name: "admin", permissions: ["read", "write", "delete"] },
      { name: "manager", permissions: ["read", "write"] },
      { name: "user", permissions: ["read"] },
    ];

    // Chèn Role vào database và lấy kết quả trả về
    const createdRoles = await Role.insertMany(roles);
    console.log("Roles added.");

    // Tạo người dùng vói các role, sử dụng _id của role
    const adminRole = createdRoles.find((role) => role.name === "admin");
    const managerRole = createdRoles.find((role) => role.name === "manager");

    const adminPassword = await bcrypt.hash("admin123", 10);
    const managerPassword = await bcrypt.hash("manager123", 10);

    const users = [
      {
        email: "admin@example.com",
        password: adminPassword,
        role: adminRole._id,
      }, // Lưu _id của role
      {
        email: "manager@example.com",
        password: managerPassword,
        role: managerRole._id,
      }, // Lưu _id của role
    ];

    await User.insertMany(users);
    console.log("Users added");

    console.log("Database đã được thêm thành công");
    process.exit(0);
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  }
};

seeDatabase();
