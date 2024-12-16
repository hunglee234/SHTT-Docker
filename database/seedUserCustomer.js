const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const Role = require("../models/Role");
const Customer = require("../models/Customer");

// Kết nối cơ sở dữ liệu MongoDB
mongoose
  .connect(
    "mongodb+srv://hung:hung@cluster0.vyvn6.mongodb.net/test_database?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Connected to MongoDB");
    runTests();
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });

// Hàm kiểm tra CRUD cơ bản
const runTests = async () => {
  try {
    // --- 1. Xóa dữ liệu cũ ---
    await User.deleteMany({});
    await Role.deleteMany({});
    await Customer.deleteMany({});
    console.log("Old data deleted!");

    // --- 2. Tạo Role ---
    const adminRole = new Role({
      name: "admin",
      permissions: ["manage_users", "view_reports", "manage_customers"],
    });
    const managerRole = new Role({
      name: "manager",
      permissions: ["view_reports", "manage_customers"],
    });
    const employeeRole = new Role({
      name: "employee",
      permissions: ["view_reports"],
    });
    await adminRole.save();
    await managerRole.save();
    await employeeRole.save();
    console.log("Roles created!");

    // --- 3. Tạo User ---
    const adminPassword = await bcrypt.hash("admin123", 10);
    const admin = new User({
      email: "admin@example.com",
      password: adminPassword,
      role: adminRole._id,
    });
    await admin.save();
    console.log("Admin created!");

    // --- 4. Đọc và kiểm tra User ---
    const fetchedAdmin = await User.findOne({
      email: "admin@example.com",
    }).populate("role");
    console.log("Fetched Admin:", fetchedAdmin);

    // --- 5. Tạo Customer ---
    const customer = new Customer({
      companyName: "TechCorp",
      contactPerson: "Alice Smith",
      contactEmail: "contact@techcorp.com",
      contactPhone: "1234567890",
      services: [
        { serviceName: "Cloud Hosting", startDate: new Date() },
        { serviceName: "Data Backup", startDate: new Date() },
      ],
    });
    await customer.save();
    console.log("Customer created!");

    // --- 6. Đọc và kiểm tra Customer ---
    const fetchedCustomer = await Customer.findOne({ companyName: "TechCorp" });
    console.log("Fetched Customer:", fetchedCustomer);

    // --- 7. Cập nhật Customer ---
    fetchedCustomer.contactPerson = "Bob Johnson";
    await fetchedCustomer.save();
    console.log("Updated Customer:", fetchedCustomer);

    // --- 8. Xóa Customer ---
    await Customer.deleteOne({ companyName: "TechCorp" });
    console.log("Customer deleted!");

    // --- 9. Đóng kết nối ---
    mongoose.connection.close();
    console.log("Database tests completed and connection closed!");
  } catch (err) {
    console.error("Error during tests:", err);
    mongoose.connection.close();
  }
};
