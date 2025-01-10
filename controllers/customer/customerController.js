const Account = require("../../models/Account/Account");
const Role = require("../../models/Role");
const InfoStaff = require("../../models/Account/InfoStaff");

exports.listCustomers = async (req, res) => {
    try {
        const { page, limit } = req.body;
        const managerRole = await Role.findOne({ name: "Manager" });
        if (!managerRole) {
            return res.status(404).json({ success: false, message: "Role 'Manager' không tồn tại." });
        }
        const accounts = await Account.find({ role: managerRole._id })
            .select("fullName email").lean()
            .skip((page - 1) * limit)
            .limit(Number(limit));
        const accountIds = accounts.map(account => account._id);
        const infoStaffs = await InfoStaff.find({ account: { $in: accountIds } })
        .populate("account", "fullName email")
        .lean();
        const result = infoStaffs.map(infoStaff => ({
            accountId: infoStaff.account._id,
            fullName: infoStaff.account.fullName,
            email: infoStaff.account.email,
            staffCode: infoStaff.staffCode,
            dateOfBirth: infoStaff.dateOfBirth,
            gender: infoStaff.gender,
            phone: infoStaff.phone,
            address: infoStaff.address,
            joinDate: infoStaff.joinDate,
            status: infoStaff.status,
            companyName: infoStaff.companyName,
            website: infoStaff.website,
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