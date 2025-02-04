const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const { saveAvatar } = require("../../utils/saveAvatar");
const Account = require("../../models/Account/Account");
const StaffAccount = require("../../models/Account/InfoStaff");
const Role = require("../../models/Role");
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);
// Tạo tài khoản khach hang
exports.createCustomer = async (req, res) => {
  try {
    const {
      companyName,
      fullName,
      email,
      phone,
      website,
      zalo,
      MST,
      address,
      staffCode,
      username,
      password,
      role: roleName,
      status,
      joinDate,
    } = req.body;

    let avatarId = null;
    if (req.file) {
      const avatarUrl = req.file.location;
      avatarId = await saveAvatar(avatarUrl);
    }

    const parsedJoinDate = dayjs(joinDate, "DD/MM/YYYY").isValid()
      ? dayjs(joinDate, "DD/MM/YYYY").toDate()
      : null;

    const userId = req.user.id;

    const account = await Account.findById(userId).populate("role");

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    if (!account.role || account.role.name !== "Admin") {
      return res
        .status(403)
        .json({ error: "Bạn không có quyền tạo khách hàng." });
    }
    // Check roleId
    const roleExists = await Role.findOne({ name: roleName });
    if (!roleExists) {
      return res.status(404).json({ error: "Role không tồn tại." });
    }

    // Kiểm tra mã khách hàng ( dùng trường chung  StaffCode)
    const existingStaffCode = await StaffAccount.findOne({ staffCode });
    if (existingStaffCode) {
      return res
        .status(400)
        .json({ message: "Mã khách hàng đã tồn tại, vui lòng thử lại" });
    }

    // Kiểm tra xem số điện thoại đã tồn tại chưa
    const existingPhone = await StaffAccount.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ message: "Phone number already exists" });
    }

    const existingTaxcode = await StaffAccount.findOne({ MST });
    if (existingTaxcode) {
      return res.status(400).json({ message: "MST already exists" });
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
    // Tạo tài khoản mới trong collection InfoStaff
    const newInfoStaff = new StaffAccount({
      avatar: avatarId,
      account: savedAccount._id,
      companyName,
      website,
      zalo,
      MST,
      phone,
      address,
      createdByManager: account._id,
      staffCode,
      status,
      joinDate: parsedJoinDate,
    });
    const savedInfoStaff = await newInfoStaff.save(); // Lưu thông tin nhân viên vào DB

    const accountWithAvatar = await StaffAccount.findById(
      savedInfoStaff._id
    ).populate({
      path: "avatar",
      select: "url",
    });

    const avatarUrl = accountWithAvatar.avatar?.url || null;

    // Dữ liệu trả về
    const responseData = {
      id: savedInfoStaff._id,
      avatar: avatarUrl,
      fullName: savedAccount.fullName,
      companyName: savedInfoStaff.companyName,
      website: savedInfoStaff.website,
      zalo: savedInfoStaff.zalo,
      MST: savedInfoStaff.MST,
      email: savedAccount.email,
      phone: savedInfoStaff.phone,
      address: savedInfoStaff.address,
      staffCode: savedInfoStaff.staffCode,
      username: savedAccount.username,
      role: savedAccount.role,
      status: savedInfoStaff.status,
      joinDate: savedInfoStaff.joinDate,
      createdByManager: savedInfoStaff.createdByManager,
    };

    res.status(201).json({
      message: "Khách hàng đã được tạo thành công",
      data: responseData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Có lỗi xảy ra khi tạo khách hàng",
      error: error.message,
    });
  }
};

// Lấy danh sách khách hàng
exports.getFullCustomerList = async (req, res) => {
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
      staffAccounts = await StaffAccount.find()
        .populate({
          path: "account",
          select: "fullName email username role",
          populate: { path: "role", select: "name" }, // Populate role từ Account
        })
        .populate({
          path: "avatar",
          select: "url", // Populate avatar từ StaffAccount
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
        .json({ message: "Không có khách hàng nào được tìm thấy." });
    }

    // Lọc các tài khoản không phải Admin
    const filteredStaffAccounts = staffAccounts.filter(
      (staff) => staff.account?.role?.name !== "Admin"
    );

    res.status(200).json({
      message: "Danh sách khách hàng",
      total: filteredStaffAccounts.length,
      data: filteredStaffAccounts,
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
exports.getStaffCustomerId = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user;

    const { ObjectId } = mongoose.Types;
    const objectId = new ObjectId(id);

    // Lấy thông tin tài khoản của người dùng hiện tại
    const currentUser = await Account.findById(userId).populate("role");

    if (!currentUser)
      return res.status(404).json({ message: "Tài khoản không tồn tại." });

    const {
      role: { name: userRole },
    } = currentUser;

    // Tìm nhân viên theo ID và populate thông tin account, role

    const staff = await StaffAccount.findOne({ account: objectId })
      .populate({
        path: "account",
        select: "fullName email username avatar role",
        populate: { path: "role", select: "name" },
      })
      .populate({
        path: "avatar", // Populate thông tin avatar
        select: "url", // Lấy chỉ trường url của avatar
      })
      .populate({
        path: "createdByManager", // Populate thông tin avatar
        select: "fullName", // Lấy chỉ trường url của avatar
      });

    // Kiểm tra nếu không tìm thấy nhân viên
    if (!staff) {
      return res
        .status(404)
        .json({ error: "Không tìm thấy nhân viên với ID được cung cấp" });
    }

    // // Kiểm tra quyền truy cập của Manager
    // if (userRole === "Admin" && staff.createdByManager.toString() !== userId) {
    //   return res.status(403).json({
    //     message: "Bạn không có quyền truy cập vào thông tin của nhân viên này.",
    //   });
    // }

    // Lấy URL của avatar nếu có
    const avatarUrl = staff.avatar?.url || null;

    // Dữ liệu trả về cho client
    const responseData = {
      infoAccountID: staff._id,
      avatar: avatarUrl,
      fullName: staff.account.fullName,
      companyName: staff.companyName,
      zalo: staff.zalo,
      MST: staff.MST,
      email: staff.account.email,
      website: staff.website,
      username: staff.account.username,
      role: staff.account.role,
      phone: staff.phone,
      address: staff.address,
      staffCode: staff.staffCode,
      status: staff.status,
      createdByManager: staff.createdByManager,
      createdDate: staff.createdAt,
      updateDate: staff.updatedAt,
    };

    // Trả về thông tin chi tiết của nhân viên
    res.status(200).json({
      message: "Thông tin chi tiết khách hàng",
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

exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params; // Lấy id nhân viên từ params
    const {
      companyName,
      fullName,
      email,
      phone,
      website,
      zalo,
      MST,
      address,
      staffCode,
      username,
      password,
      role: roleName,
      status,
    } = req.body;

    // Kiểm tra avatar nếu có
    let avatarId = null;
    if (req.file) {
      const avatarUrl = req.file.location;
      avatarId = await saveAvatar(avatarUrl);
    }

    const userId = req.user.id;

    // Lấy thông tin tài khoản của người dùng hiện tại
    const account = await Account.findById(userId).populate("role");

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    if (
      !account.role ||
      (account.role.name !== "Admin" && account.role.name !== "SuperAdmin")
    ) {
      return res
        .status(403)
        .json({ error: "Bạn không có quyền cập nhật nhân viên." });
    }

    // Tìm thông tin khách hàng cần cập nhật
    const staffAccount = await StaffAccount.findOne({
      account: id,
    }).populate("account");

    if (!staffAccount) {
      return res.status(404).json({ error: "khách hàng không tồn tại." });
    }

    // Kiểm tra role truyền vào và so sánh với Database
    if (roleName) {
      const roleExists = await Role.findOne({ name: roleName });
      if (!roleExists) {
        return res.status(404).json({ error: "Role không tồn tại." });
      }
      staffAccount.account.role = roleExists._id; // Cập nhật vai trò của nhân viên
    }

    // Kiểm tra mã khách hàng ( dùng trường chung  StaffCode)

    if (staffCode && staffCode !== staffAccount.staffCode) {
      const existingStaffCode = await StaffAccount.findOne({ staffCode });
      if (existingStaffCode) {
        return res
          .status(400)
          .json({ message: "Mã khách hàng đã tồn tại, vui lòng thử lại" });
      }
      staffAccount.staffCode = staffCode;
    }

    if (phone && phone !== staffAccount.phone) {
      const existingPhone = await StaffAccount.findOne({ phone });
      if (existingPhone) {
        return res.status(400).json({ message: "Phone number already exists" });
      }
      staffAccount.phone = phone;
    }

    if (MST && MST !== staffAccount.MST) {
      const existingTaxcode = await StaffAccount.findOne({ MST });
      if (existingTaxcode) {
        return res.status(400).json({ message: "MST already exists" });
      }
      staffAccount.MST = MST;
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

    if (status) staffAccount.status = status;

    if (companyName) staffAccount.companyName = companyName;
    if (website) staffAccount.website = website;
    if (zalo) staffAccount.zalo = zalo;

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
      companyName: staffAccount.companyName,
      website: staffAccount.website,
      zalo: staffAccount.zalo,
      MST: staffAccount.MST,
      email: staffAccount.account.email,
      phone: staffAccount.phone,
      address: staffAccount.address,
      staffCode: staffAccount.staffCode,
      username: staffAccount.account.username,
      status: staffAccount.status,
      role: staffAccount.account.role,
    };

    res.status(200).json({
      message: "Thông tin khách hàng đã được cập nhật thành công",
      data: responseData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Có lỗi xảy ra khi cập nhật thông tin nhân viên",
      error: error.message,
    });
  }
};

// Hàm xóa khách hàng
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params; // ID của StaffAccount cần xóa
    const userId = req.user.id;

    const roleSPAdmin = await Account.findById(userId).populate("role");
    if (!roleSPAdmin || roleSPAdmin.role.name !== "SuperAdmin") {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xóa khách hàng này." });
    }

    // Lấy thông tin tài khoản hiện tại và vai trò
    const currentUser = await Account.findById(id).populate("role");
    if (!currentUser) {
      return res.status(404).json({ message: "Tài khoản không tồn tại." });
    }

    // Lấy thông tin StaffAccount
    const staffAccount = await StaffAccount.findOne({
      account: currentUser._id,
    }).populate("account");
    if (!staffAccount) {
      return res.status(404).json({ message: "Khách hàng không tồn tại." });
    }
    console.log(staffAccount);

    // // Xóa cả Account và StaffAccount
    await Account.findByIdAndDelete(currentUser._id);
    await StaffAccount.findByIdAndDelete(staffAccount._id);

    res.status(200).json({ message: "Xóa khách hàng thành công." });
  } catch (error) {
    console.error("Error in deleteStaff:", error);
    res.status(500).json({
      message: "Có lỗi xảy ra trong quá trình xóa nhân viên.",
      error: error.message,
    });
  }
};
