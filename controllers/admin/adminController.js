const Customer = require("../../models/Customer");
const User = require("../../models/User/User");
const InfoUser = require("../../models/User/InfoUser");

// Quản lý khách hàng
exports.createCustomer = async (req, res) => {
  try {
    const { name, company, email, phone } = req.body;
    const newCustomer = new Customer({
      name,
      company,
      email,
      phone,
      createdBy: req.user.userId,
    });
    await newCustomer.save();
    res.status(201).json({
      message: "Customer created successfully",
      customer: newCustomer,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.status(200).json(customers);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

// Cập nhật khách hàng
exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, company, email, phone } = req.body;

    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      { name, company, email, phone },
      { new: true }
    );

    if (!updatedCustomer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.status(200).json({
      message: "Customer updated successfully",
      customer: updatedCustomer,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

// Xóa khách hàng
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCustomer = await Customer.findByIdAndDelete(id);
    if (!deletedCustomer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

// Quản lý tài khoản
exports.createAccount = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "Email already exists" });

    const bcrypt = require("bcrypt");
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      createdBy: req.user.userId,
    });
    await user.save();
    res.status(201).json({ message: "Account created successfully", user });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

exports.getAccounts = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

exports.updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, password, role },
      { new: true }
    );
    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    res
      .status(200)
      .json({ message: "Account updated successfully", user: updatedUser });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};
