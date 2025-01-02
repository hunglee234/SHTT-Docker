const mongoose = require("mongoose");
const Role = require("../models/Role");

const mongoURL =
  "mongodb+srv://hung:hung@cluster0.vyvn6.mongodb.net/users234?retryWrites=true&w=majority&appName=Cluster0";

// Dữ liệu seed
const roles = [
  { name: "Admin", permissions: ["create", "read", "update", "delete"] },
  { name: "Manager", permissions: ["create", "read", "update", "delete"] },
  { name: "Staff", permissions: ["read", "update"] },
  { name: "Collaborator", permissions: ["read", "update"] },
  { name: "User", permissions: ["read", "update"] },
];

// Hàm seed dữ liệu
async function seedRoles() {
  try {
    // Kết nối tới MongoDB
    await mongoose.connect(mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Xóa dữ liệu cũ trong collection Role
    await Role.deleteMany({});
    console.log("Cleared existing roles");

    // Chèn dữ liệu mới
    await Role.insertMany(roles);
    console.log("Seeded roles successfully");

    // Đóng kết nối
    await mongoose.connection.close();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error seeding roles:", error);
    process.exit(1); // Thoát với mã lỗi
  }
}

// Chạy hàm seed
seedRoles();
