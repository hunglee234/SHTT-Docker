const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User/User"); // Import User model
const InfoUser = require("../models/User/InfoUser"); // Import InfoUser model
const Role = require("../models/Role"); // Import Role model (giả sử đã tạo trước đó)

const dbURI =
  "mongodb+srv://hung:hung@cluster0.vyvn6.mongodb.net/users234?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("Kết nối đến cơ sở dữ liệu thành công!");

    // Tạo một vài Role (Chức vụ) mẫu
    const roles = await Role.insertMany([
      { name: "Admin1" },
      { name: "User1" },
    ]);

    // Tạo một số User mẫu
    const users = await User.insertMany([
      {
        fullName: "Nguyễn Văn A",
        email: "nguyenvana@example.com",
        password: await bcrypt.hash("password123", 10), // Mã hóa mật khẩu
        username: "nguyenvana",
        role: roles[0]._id, // Gán quyền Admin
      },
      {
        fullName: "Nguyễn Thị B",
        email: "nguyenthib@example.com",
        password: await bcrypt.hash("password123", 10), // Mã hóa mật khẩu
        username: "nguyenthib",
        role: roles[1]._id, // Gán quyền User
      },
    ]);

    // Tạo dữ liệu cho InfoUser liên kết với User đã tạo
    await InfoUser.insertMany([
      {
        avatar: "https://example.com/avatar1.jpg",
        dateOfBirth: new Date("1990-01-01"),
        gender: "Nam",
        phone: "0123456789",
        address: {
          province: "Hà Nội",
          city: "Hà Nội",
          district: "Đống Đa",
          detail: "123 Đường ABC",
        },
        employeeId: "NV001",
        role: roles[0]._id, // Gán Role Admin cho InfoUser
        joinDate: new Date("2020-01-01"),
        status: "Đang làm",
        branch: "Quản lý",
        user: users[0]._id, // Liên kết với User 1
      },
      {
        avatar: "https://example.com/avatar2.jpg",
        dateOfBirth: new Date("1995-05-05"),
        gender: "Nữ",
        phone: "0987654321",
        address: {
          province: "Hồ Chí Minh",
          city: "Hồ Chí Minh",
          district: "Quận 1",
          detail: "456 Đường XYZ",
        },
        employeeId: "NV002",
        role: roles[1]._id, // Gán Role User cho InfoUser
        joinDate: new Date("2021-05-05"),
        status: "Đang làm",
        branch: "Nhân viên",
        user: users[1]._id, // Liên kết với User 2
      },
    ]);

    console.log("Dữ liệu đã được chèn thành công!");
    mongoose.connection.close(); // Đóng kết nối khi hoàn tất
  })
  .catch((error) => {
    console.error("Lỗi kết nối:", error);
  });
