const User = require("../../models/User");
const bcrypt = require("bcrypt");

// Tạo tài khoản nhân viên
exports.createStaff = async (req, res) => {
  const { username, password } = req.body;
  const managerId = req.user.id;

  try {
    // Kiểm tra số lượng nhân viên đã tạo
    const staffCount = await User.countDocuments({
      createdBy: managerId,
      role: "Employee",
    });

    if (staffCount >= 2) {
      return res
        .status(403)
        .json({ message: "Manager can only create up to 2 employees" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      password: hashedPassword,
      role: "Employee",
      createdBy: managerId,
    });

    const savedUser = await user.save();
    res
      .status(201)
      .json({ message: "Employee created successfully", user: savedUser });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating employee", error: error.message });
  }
};

// Lấy danh sách nhân viên
exports.listStaff = async (req, res) => {
  const managerId = req.user.id;

  try {
    const staff = await User.find({ createdBy: managerId, role: "Employee" });
    res.status(200).json(staff);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving staff", error: error.message });
  }
};

// Lấy thông tin chi tiết nhân viên
exports.getStaffById = async (req, res) => {
  const { id } = req.params;
  const managerId = req.user.id;

  try {
    const staff = await User.findOne({
      _id: id,
      createdBy: managerId,
      role: "Employee",
    });

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    res.status(200).json(staff);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving staff", error: error.message });
  }
};

// Cập nhật thông tin nhân viên
exports.updateStaff = async (req, res) => {
  const { id } = req.params;
  const managerId = req.user.id;
  const { username, password } = req.body;

  try {
    const staff = await User.findOne({
      _id: id,
      createdBy: managerId,
      role: "Employee",
    });

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    // Cập nhật thông tin
    if (username) staff.username = username;
    if (password) staff.password = await bcrypt.hash(password, 10);

    const updatedStaff = await staff.save();
    res
      .status(200)
      .json({ message: "Staff updated successfully", staff: updatedStaff });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating staff", error: error.message });
  }
};

// Xóa nhân viên
exports.deleteStaff = async (req, res) => {
  const { id } = req.params;
  const managerId = req.user.id;

  try {
    const staff = await User.findOneAndDelete({
      _id: id,
      createdBy: managerId,
      role: "Employee",
    });

    if (!staff) {
      return res
        .status(404)
        .json({ message: "Staff not found or not authorized" });
    }

    res.status(200).json({ message: "Staff deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting staff", error: error.message });
  }
};
