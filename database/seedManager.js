const mongoose = require("mongoose");
const Role = require("../models/Role");
const InfoManager = require("../models/Account/InfoManager");
const Account = require("../models/Account/Account");

// const mongoURL =
//   "mongodb+srv://hung:hung@cluster0.vyvn6.mongodb.net/users234?retryWrites=true&w=majority&appName=Cluster0";

const seedData = async () => {
  try {
    // Kết nối MongoDB
    await mongoose.connect(
      "mongodb+srv://hung:hung@cluster0.vyvn6.mongodb.net/users234?retryWrites=true&w=majority&appName=Cluster0",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    console.log("Connected to MongoDB");

    // Xóa dữ liệu cũ
    await InfoManager.deleteMany({});
    await Account.deleteMany({});

    console.log("Cleared existing data");

    // Tạo tài khoản mẫu
    const accountData = [
      {
        fullName: "John Doe",
        email: "john@example.com",
        password: "password123", // Mã hóa mật khẩu trong ứng dụng thực tế
        username: "john_doe",
        role: "676925714bf9f1a02a9ca7d9",
      },
      {
        fullName: "Jane Smith",
        email: "jane@example.com",
        password: "password123",
        username: "jane_smith",
        role: "676925714bf9f1a02a9ca7d9",
      },
    ];

    const accounts = await Account.insertMany(accountData);
    console.log("Seeded accounts");

    // Tạo InfoManager mẫu
    const infoManagerData = [
      {
        companyName: "Tech Solutions Ltd",
        account: accounts[0]._id,
        website: "https://techsolutions.com",
        phone: "123456789",
        address: {
          province: "California",
          city: "Los Angeles",
          district: "Central LA",
          detail: "123 Tech Street",
        },
      },
      {
        companyName: "Innovate Corp",
        account: accounts[1]._id,
        website: "https://innovatecorp.com",
        phone: "987654321",
        address: {
          province: "New York",
          city: "New York City",
          district: "Manhattan",
          detail: "456 Innovation Road",
        },
      },
    ];

    await InfoManager.insertMany(infoManagerData);
    console.log("Seeded InfoManager data");

    // Đóng kết nối
    mongoose.connection.close();
    console.log("Database seeding complete");
  } catch (error) {
    console.error("Error seeding database:", error);
    mongoose.connection.close();
  }
};

seedData();
