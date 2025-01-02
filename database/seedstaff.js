const mongoose = require("mongoose");
const Account = require("../models/Account/Account"); // Đường dẫn tới file Account schema
const InfoStaff = require("../models/Account/InfoStaff"); // Đường dẫn tới file InfoStaff schema

// Kết nối tới MongoDB
const uri =
  "mongodb+srv://hung:hung@cluster0.vyvn6.mongodb.net/users234?retryWrites=true&w=majority&appName=Cluster0"; // Thay `your_database_name` bằng tên DB của bạn
mongoose.connect(uri);

mongoose.connection.once("open", async () => {
  console.log("Connected to MongoDB!");

  try {
    // Tạo các tài liệu mẫu cho "Account"
    const account1 = await Account.create({
      fullName: "Nguyễn Văn Anh",
      email: "nguyenvana123@example.com",
      password: "hashedpassword123", // Thay bằng mật khẩu đã hash nếu cần
      username: "nguyenvananh",
      role: new mongoose.Types.ObjectId(), // Thay bằng ID role thật nếu đã có Role
    });

    const account2 = await Account.create({
      fullName: "Trần Thị C",
      email: "tranthic@example.com",
      password: "hashedpassword456",
      username: "tranthic",
      role: new mongoose.Types.ObjectId(),
    });

    const account3 = await Account.create({
      fullName: "Nguyễn Trung Em",
      email: "trungnmt@gmail.com",
      password: "hashedpassword456",
      username: "trungnmt",
      role: new mongoose.Types.ObjectId(),
    });

    console.log("Seeded Accounts!");

    // Tạo các tài liệu mẫu cho "InfoStaff"
    const staff1 = await InfoStaff.create({
      dateOfBirth: new Date("1990-01-01"),
      gender: "Nam",
      phone: "0123456789",
      address: {
        province: "Hà Nội",
        city: "Ba Đình",
        district: "Phường A",
        detail: "Số 123 Đường ABC",
      },
      position: "Nhân viên",
      account: account1._id,
      createdByManager: new mongoose.Types.ObjectId(), // Thay bằng ID của InfoManager thật
    });

    const staff2 = await InfoStaff.create({
      dateOfBirth: new Date("1995-05-20"),
      gender: "Nữ",
      phone: "0987654321",
      address: {
        province: "TP. Hồ Chí Minh",
        city: "Quận 1",
        district: "Phường B",
        detail: "Số 456 Đường XYZ",
      },
      position: "Cộng tác viên",
      account: account2._id,
      createdByManager: new mongoose.Types.ObjectId(),
    });

    const staff3 = await InfoStaff.create({
      dateOfBirth: new Date("2024-05-20"),
      gender: "Nữ",
      phone: "0986654321",
      address: {
        province: "TP. Hồ Chí Minh",
        city: "Quận 1",
        district: "Phường B",
        detail: "Số 456 Đường XYZ",
      },
      position: "Cộng tác viên",
      account: account3._id,
      createdByManager: new mongoose.Types.ObjectId(),
    });

    console.log("Seeded InfoStaff!");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    mongoose.connection.close();
  }
});
