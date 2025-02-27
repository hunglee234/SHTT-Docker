const Account = require("../../models/Account/Account");
const Role = require("../../models/Role");
const InfoStaff = require("../../models/Account/InfoStaff");

exports.listCustomers = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const managerRole = await Role.findOne({ name: "Manager" });
    if (!managerRole) {
      return res
        .status(404)
        .json({ success: false, message: "Role 'Manager' không tồn tại." });
    }
    const accounts = await Account.find({ role: managerRole._id })
      .select("fullName email")
      .lean()
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const accountIds = accounts.map((account) => account._id);

    const infoStaffs = await InfoStaff.find({ account: { $in: accountIds } })
      .populate("account", "fullName email")
      .populate({
        path: "avatar",
        select: "url",
      })
      .sort({ createdAt: -1 })
      .select("createdAt staffCode phone status account avatar")
      .lean();

    const result = infoStaffs.map((infoStaff) => ({
      accountId: infoStaff.account._id,
      avatar: infoStaff.avatar,
      fullName: infoStaff.account.fullName,
      email: infoStaff.account.email,
      staffCode: infoStaff.staffCode,
      phone: infoStaff.phone,
      joinDate: infoStaff.createdAt,
      status: infoStaff.status,
    }));
    // Tổng số lượng tài khoản
    const totalItems = await Account.countDocuments({ role: managerRole._id });

    res.json({
      success: true,
      data: result,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách managers:", error);
    res.status(500).json({ success: false, message: "Lỗi server." });
  }
};

exports.listCustomersSearch = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search_value,
      from_date,
      to_date,
    } = req.query;

    const managerRole = await Role.findOne({ name: "Manager" });

    if (!managerRole) {
      return res
        .status(404)
        .json({ success: false, message: "Role 'Manager' không tồn tại." });
    }

    let accounts = [];
    let infoStaffs = [];
    let accountIds = [];

    // 🔹 Truy vấn Account theo fullName
    const accountQuery = { role: managerRole._id };

    if (search_value) {
      accountQuery.fullName = { $regex: search_value, $options: "i" };
    }

    if (from_date && to_date) {
      accountQuery.createdDate = {
        $gte: new Date(from_date),
        $lte: new Date(to_date).setHours(23, 59, 59, 999),
      };
    }

    accounts = await Account.find(accountQuery)
      .select("fullName email createdDate")
      .sort({ createdDate: -1 })
      .lean();

    accountIds = accounts.map((acc) => acc._id);

    // 🔹 Truy vấn InfoStaff theo companyName hoặc accountId
    let infoStaffQuery = {};

    if (search_value) {
      infoStaffQuery.$or = [
        { companyName: { $regex: search_value, $options: "i" } },
        ...(accountIds.length ? [{ account: { $in: accountIds } }] : []),
      ];
    } else if (accountIds.length) {
      infoStaffQuery.account = { $in: accountIds };
    }

    infoStaffs = await InfoStaff.find(infoStaffQuery)
      .populate("account", "fullName email createdDate")
      .populate({ path: "avatar", select: "url" })
      .select("createdAt staffCode phone status account avatar companyName")
      .lean();

    // 🔹 Hợp nhất dữ liệu từ Account & InfoStaff
    let resultMap = new Map();

    accounts.forEach((account) => {
      resultMap.set(account._id.toString(), {
        accountId: account._id,
        fullName: account.fullName,
        email: account.email,
        createdDate: account.createdDate,
        companyName: null,
        staffCode: null,
        phone: null,
        joinDate: null,
        status: null,
        avatar: null,
      });
    });

    infoStaffs.forEach((infoStaff) => {
      const accId = infoStaff.account?._id.toString();

      if (accId && resultMap.has(accId)) {
        // 🔹 Nếu accountId đã có trong danh sách, cập nhật thêm thông tin từ InfoStaff
        let existingData = resultMap.get(accId);
        existingData.companyName =
          infoStaff.companyName || existingData.companyName;
        existingData.staffCode = infoStaff.staffCode || existingData.staffCode;
        existingData.phone = infoStaff.phone || existingData.phone;
        existingData.joinDate = infoStaff.createdAt || existingData.joinDate;
        existingData.status = infoStaff.status || existingData.status;
        existingData.avatar = infoStaff.avatar || existingData.avatar;
        resultMap.set(accId, existingData);
      } else {
        // 🔹 Nếu accountId không tồn tại (có thể InfoStaff không liên kết với Account)
        resultMap.set(infoStaff._id.toString(), {
          accountId: infoStaff.account?._id || null,
          fullName: infoStaff.account?.fullName || null,
          email: infoStaff.account?.email || null,
          createdDate: infoStaff.account?.createdDate || null,
          companyName: infoStaff.companyName,
          staffCode: infoStaff.staffCode,
          phone: infoStaff.phone,
          joinDate: infoStaff.createdAt,
          status: infoStaff.status,
          avatar: infoStaff.avatar,
        });
      }
    });

    // Chuyển Map thành array
    let result = Array.from(resultMap.values());

    // 🔹 Sắp xếp theo ngày tạo gần nhất
    result = result.sort(
      (a, b) => new Date(b.createdDate) - new Date(a.createdDate)
    );

    // 🔹 Áp dụng phân trang
    const startIndex = (page - 1) * limit;
    const paginatedResult = result.slice(
      startIndex,
      startIndex + Number(limit)
    );

    res.json({
      success: true,
      data: paginatedResult,
      totalItems: result.length,
      totalPages: Math.ceil(result.length / limit),
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách managers:", error);
    res.status(500).json({ success: false, message: "Lỗi server." });
  }
};
