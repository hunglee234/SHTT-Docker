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
      limit = 20,
      search_value,
      from_date,
      to_date,
    } = req.query;

    let accountIdsBySearch = new Set();
    let accountIdsByDate = new Set();
    let finalAccountIds = new Set();

    // 🔹 1. Lấy role Manager
    const managerRole = await Role.findOne({ name: "Manager" });

    if (!managerRole) {
      return res.status(404).json({
        success: false,
        message: "Role 'Manager' không tồn tại.",
      });
    }

    // 🔹 2. Truy vấn theo search_value (nếu có)
    if (search_value?.trim()) {
      const accountQuery = {
        role: managerRole._id,
        fullName: { $regex: search_value, $options: "i" },
      };

      const foundAccounts = await Account.find(accountQuery)
        .select("_id")
        .lean();

      foundAccounts.forEach((acc) =>
        accountIdsBySearch.add(acc._id.toString())
      );

      const foundInfoStaffs = await InfoStaff.find({
        companyName: { $regex: search_value, $options: "i" },
      })
        .populate("account", "_id role")
        .lean();

      foundInfoStaffs.forEach((info) => {
        if (
          info.account &&
          info.account.role.toString() === managerRole._id.toString()
        ) {
          accountIdsBySearch.add(info.account._id.toString());
        }
      });
    }

    // 🔹 3. Truy vấn theo from_date & to_date (nếu có)
    if (from_date && to_date) {
      const fromDate = new Date(from_date);
      const toDate = new Date(to_date);
      if (!isNaN(fromDate) && !isNaN(toDate)) {
        toDate.setHours(23, 59, 59, 999);

        const foundAccountsByDate = await Account.find({
          role: managerRole._id,
          createdDate: { $gte: fromDate, $lte: toDate },
        })
          .select("_id")
          .lean();

        foundAccountsByDate.forEach((acc) =>
          accountIdsByDate.add(acc._id.toString())
        );
      }
    }

    // 🔹 4. Xác định danh sách tài khoản cuối cùng
    if (search_value && from_date && to_date) {
      // Nếu cả search_value và khoảng ngày tồn tại, chỉ lấy giao của 2 tập hợp
      finalAccountIds = new Set(
        [...accountIdsBySearch].filter((id) => accountIdsByDate.has(id))
      );
    } else if (search_value) {
      finalAccountIds = accountIdsBySearch;
    } else if (from_date && to_date) {
      finalAccountIds = accountIdsByDate;
    } else {
      // Nếu không có điều kiện nào, lấy toàn bộ Managers
      const defaultAccounts = await Account.find({ role: managerRole._id })
        .select("_id")
        .lean();
      defaultAccounts.forEach((acc) => finalAccountIds.add(acc._id.toString()));
    }

    // 🔹 5. Truy vấn danh sách accounts từ finalAccountIds
    const accounts = await Account.find({ _id: { $in: [...finalAccountIds] } })
      .select("fullName email createdDate")
      .lean();

    // 🔹 6. Truy vấn danh sách InfoStaff từ finalAccountIds
    const infoStaffs = await InfoStaff.find({
      account: { $in: [...finalAccountIds] },
    })
      .populate("account", "fullName email createdDate")
      .populate({ path: "avatar", select: "url" })
      .select("createdAt staffCode phone status account avatar companyName")
      .lean();

    // 🔹 7. Hợp nhất dữ liệu từ Account & InfoStaff
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

    // 🔹 8. Chuyển Map thành array
    let result = Array.from(resultMap.values());

    // 🔹 9. Sắp xếp theo ngày tạo gần nhất
    result.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));

    // 🔹 10. Áp dụng phân trang
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
