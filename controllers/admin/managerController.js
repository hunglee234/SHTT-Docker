const bcrypt = require("bcrypt");
const { saveAvatar } = require("../../utils/saveAvatar");
const Account = require("../../models/Account/Account");
const StaffAccount = require("../../models/Account/InfoStaff");
const Role = require("../../models/Role");
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);
// Tạo tài khoản nhân viên
exports.createStaff = async (req, res) => {
  try {
    const {
      fullName,
      dateOfBirth,
      gender,
      email,
      phone,
      address,
      staffCode,
      username,
      password,
      joinDate,
      role: roleName,
    } = req.body;

    let avatarId = null;
    if (req.file) {
      const avatarUrl = req.file.location;
      avatarId = await saveAvatar(avatarUrl);
    }

    // Chuyển đổi chuỗi ngày tháng từ định dạng DD/MM/YYYY thành đối tượng Date
    const parsedDateOfBirth = dayjs(dateOfBirth, "DD/MM/YYYY").isValid()
      ? dayjs(dateOfBirth, "DD/MM/YYYY").toDate()
      : null;
    const parsedJoinDate = dayjs(joinDate, "DD/MM/YYYY").isValid()
      ? dayjs(joinDate, "DD/MM/YYYY").toDate()
      : null;

    const userId = req.user.id;

    const account = await Account.findById(userId).populate("role");

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    if (!account.role || account.role.name !== "Manager") {
      return res
        .status(403)
        .json({ error: "Bạn không có quyền tạo nhân viên." });
    }
    // Check roleId
    const roleExists = await Role.findOne({ name: roleName });
    if (!roleExists) {
      return res.status(404).json({ error: "Role không tồn tại." });
    }

    const existingPhone = await StaffAccount.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ message: "Phone number already exists" });
    }

    const existingEmail = await Account.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        message: "Email đã tồn tại!",
      });
    }

    // Kiểm tra username có tồn tại không
    const existingUsername = await Account.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({
        message: "Username đã tồn tại!",
      });
    }

    // Kiểm tra số lượng nhân viên và cộng tác viên tạo bởi Manager này :
    const staffAccounts = await StaffAccount.find({
      createdByManager: account._id,
    }).populate({
      path: "account",
      populate: {
        path: "role",
        select: "name",
      },
    });

    const totalAccounts = staffAccounts.length;

    if (totalAccounts >= 3) {
      return res.status(400).json({
        error: "Bạn chỉ được tạo tối đa 3 tài khoản.",
      });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo tài khoản mới trong collection Account
    const newAccount = new Account({
      fullName,
      email,
      password: hashedPassword,
      username,
      role: roleExists._id,
    });

    const savedAccount = await newAccount.save(); // Lưu tài khoản vào DB
    // Tạo thông tin nhân viên trong collection InfoStaff
    const newInfoStaff = new StaffAccount({
      avatar: avatarId,
      account: savedAccount._id,
      dateOfBirth: parsedDateOfBirth,
      gender,
      phone,
      address,
      createdByManager: account._id,
      staffCode,
      joinDate: parsedJoinDate,
    });
    const savedInfoStaff = await newInfoStaff.save(); // Lưu thông tin nhân viên vào DB

    const accountWithAvatar = await StaffAccount.findById(
      savedInfoStaff._id
    ).populate({
      path: "avatar", // Tham chiếu tới collection Avatar
      select: "url", // Chỉ lấy trường url trong Avatar
    });

    console.log(accountWithAvatar);
    const avatarUrl = accountWithAvatar.avatar?.url || null;

    // Dữ liệu trả về cho client
    const responseData = {
      id: savedInfoStaff._id,
      avatar: avatarUrl,
      fullName: savedAccount.fullName,
      dateOfBirth: savedInfoStaff.dateOfBirth,
      gender: savedInfoStaff.gender,
      email: savedAccount.email,
      phone: savedInfoStaff.phone,
      address: savedInfoStaff.address,
      joinDate: savedInfoStaff.joinDate,
      staffCode: savedInfoStaff.staffCode,
      username: savedAccount.username,
      role: savedAccount.role,
      status: savedInfoStaff.status,
    };

    res.status(201).json({
      message: "Nhân viên đã được tạo thành công",
      data: responseData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Có lỗi xảy ra khi tạo nhân viên",
      error: error.message,
    });
  }
};

// Lấy danh sách nhân viên
exports.getFullStaffList = async (req, res) => {
  try {
    const userId = req.user.id;

    // Lấy thông tin tài khoản của người dùng hiện tại
    const currentUser = await Account.findById(userId).populate("role");

    if (!currentUser) {
      return res.status(404).json({ message: "Tài khoản không tồn tại." });
    }

    // Xác định quyền của người dùng
    const userRole = currentUser.role.name;

    let staffAccounts;
    if (userRole === "Admin") {
      // Admin có quyền xem toàn bộ danh sách
      staffAccounts = await StaffAccount.find().populate({
        path: "account",
        select: "fullName email username avatar role",
        populate: { path: "role", select: "name" },
      });
    } else if (userRole === "Manager") {
      // Manager chỉ được xem danh sách do họ tạo ra
      staffAccounts = await StaffAccount.find({
        createdByManager: currentUser._id,
      })
        .populate({
          path: "account",
          select: "fullName email username avatar role",
          populate: { path: "role", select: "name" },
        })
        .populate({
          path: "createdByManager",
          select: "fullName",
        });
    } else {
      return res.status(403).json({
        message: "Bạn không có quyền truy cập vào danh sách này.",
      });
    }

    // Kiểm tra nếu không có nhân viên nào
    if (!staffAccounts || staffAccounts.length === 0) {
      return res
        .status(404)
        .json({ message: "Không có nhân viên nào được tìm thấy." });
    }

    // Phân loại nhân viên và cộng tác viên
    const employees = staffAccounts.filter(
      (staff) => staff.account?.role?.name === "Staff"
    );
    const collaborators = staffAccounts.filter(
      (staff) => staff.account?.role?.name === "Collaborator"
    );

    res.status(200).json({
      message: "Danh sách nhân viên đầy đủ thông tin.",
      total: staffAccounts.length,
      data: {
        employees,
        collaborators,
      },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Giá trị truy vấn không hợp lệ.",
        details: `Invalid ${error.path} value: ${error.value}`,
      });
    }
    console.error("Error in getFullStaffList:", error);
    res.status(500).json({
      message: "Có lỗi xảy ra trong hệ thống.",
      error: error.message,
    });
  }
};

// // Lấy thông tin chi tiết nhân viên
exports.getStaffById = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user;

    // Lấy thông tin tài khoản của người dùng hiện tại
    const currentUser = await Account.findById(userId).populate("role");

    if (!currentUser)
      return res.status(404).json({ message: "Tài khoản không tồn tại." });

    const {
      role: { name: userRole },
    } = currentUser;

    // Tìm nhân viên theo ID và populate thông tin account, role
    const staff = await StaffAccount.findById(id)
      .populate({
        path: "account",
        select: "fullName email username avatar role",
        populate: { path: "role", select: "name" },
      })
      .populate({
        path: "avatar", // Populate thông tin avatar
        select: "url", // Lấy chỉ trường url của avatar
      });

    // Kiểm tra nếu không tìm thấy nhân viên
    if (!staff) {
      return res
        .status(404)
        .json({ error: "Không tìm thấy nhân viên với ID được cung cấp" });
    }

    // Kiểm tra quyền truy cập của Manager
    if (
      userRole === "Manager" &&
      staff.createdByManager.toString() !== userId
    ) {
      return res.status(403).json({
        message: "Bạn không có quyền truy cập vào thông tin của nhân viên này.",
      });
    }

    // Lấy URL của avatar nếu có
    const avatarUrl = staff.avatar?.url || null;

    // Dữ liệu trả về cho client
    const responseData = {
      id: staff._id,
      avatar: avatarUrl,
      fullName: staff.account.fullName,
      email: staff.account.email,
      username: staff.account.username,
      role: staff.account.role,
      phone: staff.phone,
      address: staff.address,
      staffCode: staff.staffCode,
      dateOfBirth: staff.dateOfBirth,
      gender: staff.gender,
      joinDate: staff.joinDate,
      status: staff.status,
    };

    // Trả về thông tin chi tiết của nhân viên
    res.status(200).json({
      message: "Thông tin chi tiết nhân viên",
      data: responseData,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        error: `Invalid ${error.path} value: ${error.value}`,
      });
    }
    res.status(500).json({
      error: "Có lỗi xảy ra trong hệ thống",
      details: error.message,
    });
  }
};

// // Cập nhật thông tin nhân viên
// Hàm cập nhật thông tin nhân viê

exports.updateStaff = async (req, res) => {
  try {
    const { id } = req.params; // Lấy id nhân viên từ params
    const {
      fullName,
      dateOfBirth,
      gender,
      email,
      phone,
      address,
      staffCode,
      username,
      password,
      joinDate,
      status,
      role: roleName,
    } = req.body;

    // Kiểm tra avatar nếu có
    let avatarId = null;
    if (req.file) {
      const avatarUrl = req.file.location;
      avatarId = await saveAvatar(avatarUrl);
    }

    // Chuyển đổi chuỗi ngày tháng từ định dạng DD/MM/YYYY thành đối tượng Date
    const parsedDateOfBirth = dayjs(dateOfBirth, "DD/MM/YYYY").isValid()
      ? dayjs(dateOfBirth, "DD/MM/YYYY").toDate()
      : null;
    const parsedJoinDate = dayjs(joinDate, "DD/MM/YYYY").isValid()
      ? dayjs(joinDate, "DD/MM/YYYY").toDate()
      : null;

    const userId = req.user.id;

    // Lấy thông tin tài khoản của người dùng hiện tại
    const account = await Account.findById(userId).populate("role");

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    if (!account.role || account.role.name !== "Manager") {
      return res
        .status(403)
        .json({ error: "Bạn không có quyền cập nhật nhân viên." });
    }

    // Tìm thông tin nhân viên cần cập nhật
    const staffAccount = await StaffAccount.findById(id).populate("account");

    if (!staffAccount) {
      return res.status(404).json({ error: "Nhân viên không tồn tại." });
    }

    // Kiểm tra role truyền vào và so sánh với Database
    if (roleName) {
      const roleExists = await Role.findOne({ name: roleName });
      if (!roleExists) {
        return res.status(404).json({ error: "Role không tồn tại." });
      }
      staffAccount.account.role = roleExists._id; // Cập nhật vai trò của nhân viên
    }

    if (phone && phone !== staffAccount.phone) {
      const existingPhone = await StaffAccount.findOne({ phone });
      if (existingPhone) {
        return res.status(400).json({ message: "Phone number already exists" });
      }
      staffAccount.phone = phone;
    }

    if (email && email !== staffAccount.account.email) {
      const existingEmail = await Account.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({
          message: "Email đã tồn tại!",
        });
      }
      staffAccount.account.email = email;
    }

    // Kiểm tra username có tồn tại không
    if (username && username !== staffAccount.account.username) {
      const existingUsername = await Account.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({
          message: "Username đã tồn tại!",
        });
      }
      staffAccount.account.username = username;
    }

    // Cập nhật các thông tin khác nếu có thay đổi
    if (fullName) staffAccount.account.fullName = fullName;
    if (address) staffAccount.address = address;
    if (staffCode) staffAccount.staffCode = staffCode;
    if (status) staffAccount.status = status;
    if (dateOfBirth) {
      staffAccount.dateOfBirth = parsedDateOfBirth;
    }
    if (joinDate) {
      staffAccount.joinDate = parsedJoinDate;
    }

    if (gender) staffAccount.gender = gender;

    // Cập nhật avatar nếu có
    if (avatarId) {
      staffAccount.avatar = avatarId;
    }

    // Cập nhật username và password nếu có
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      staffAccount.account.password = hashedPassword; // Mã hóa mật khẩu
    }

    // Lưu thông tin nhân viên và tài khoản
    await staffAccount.save();
    await staffAccount.account.save();

    // Trả về thông tin nhân viên đã cập nhật
    const accountWithAvatar = await StaffAccount.findById(
      staffAccount._id
    ).populate({
      path: "avatar",
      select: "url",
    });

    const avatarUrl = accountWithAvatar.avatar?.url || null;

    const responseData = {
      id: staffAccount._id,
      avatar: avatarUrl,
      fullName: staffAccount.account.fullName,
      dateOfBirth: staffAccount.dateOfBirth,
      gender: staffAccount.gender,
      email: staffAccount.account.email,
      phone: staffAccount.phone,
      address: staffAccount.address,
      joinDate: staffAccount.joinDate,
      staffCode: staffAccount.staffCode,
      username: staffAccount.account.username,
      status: staffAccount.status,
      role: staffAccount.account.role,
    };

    res.status(200).json({
      message: "Thông tin nhân viên đã được cập nhật thành công",
      data: responseData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Có lỗi xảy ra khi cập nhật thông tin nhân viên",
      error: error.message,
    });
  }
};

// Hàm xóa nhân viên
exports.deleteStaff = async (req, res) => {
  try {
    const { id } = req.params; // ID của StaffAccount cần xóa
    const userId = req.user.id;

    // Lấy thông tin tài khoản hiện tại và vai trò
    const currentUser = await Account.findById(userId).populate("role");
    if (!currentUser) {
      return res.status(404).json({ message: "Tài khoản không tồn tại." });
    }

    const userRole = currentUser.role.name;

    // Lấy thông tin StaffAccount
    const staffAccount = await StaffAccount.findById(id).populate("account");
    if (!staffAccount) {
      return res.status(404).json({ message: "Nhân viên không tồn tại." });
    }

    // Kiểm tra quyền xóa
    if (
      userRole === "Manager" &&
      staffAccount.createdByManager.toString() !== userId
    ) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xóa nhân viên này." });
    }

    // Xóa cả Account và StaffAccount
    await Account.findByIdAndDelete(staffAccount.account._id);
    await StaffAccount.findByIdAndDelete(id);

    res.status(200).json({ message: "Xóa nhân viên thành công." });
  } catch (error) {
    console.error("Error in deleteStaff:", error);
    res.status(500).json({
      message: "Có lỗi xảy ra trong quá trình xóa nhân viên.",
      error: error.message,
    });
  }
};
