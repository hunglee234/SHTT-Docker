const mongoose = require("mongoose");
const User = require("../models/User/User");
const Role = require("../models/Role");
async function checkData() {
  try {
    // Kết nối tới MongoDB
    await mongoose.connect(
      "mongodb+srv://hung:hung@cluster0.vyvn6.mongodb.net/users234?retryWrites=true&w=majority&appName=Cluster0"
    );
    console.log("Kết nối thành công tới MongoDB");

    // Lấy dữ liệu từ các collection
    const staffAccounts = await mongoose.connection
      .collection("infostaffs")
      .find()
      .toArray();
    const users = await mongoose.connection
      .collection("users")
      .find()
      .toArray();
    const roles = await mongoose.connection
      .collection("roles")
      .find()
      .toArray();

    console.log("Dữ liệu trong StaffAccount:", staffAccounts);
    console.log("Dữ liệu trong User:", users);
    console.log("Dữ liệu trong Role:", roles);

    // Đóng kết nối
    await mongoose.connection.close();
  } catch (error) {
    console.error("Lỗi:", error);
  }
}

checkData();
