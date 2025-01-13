const Account = require("../../models/Account/Account");
const Role = require("../../models/Role");
const InfoStaff = require("../../models/Account/InfoStaff");

exports.listCustomers = async (req, res) => {
    try {
        const { page, limit } = req.query;
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
        .populate("account", "fullName email").populate({
            path: "avatar",
            select: "url"
        })
        .lean();
        const result = infoStaffs.map(infoStaff => ({
            accountId: infoStaff.account._id,
            avatar: infoStaff.avatar,
            fullName: infoStaff.account.fullName,
            email: infoStaff.account.email,
            staffCode: infoStaff.staffCode,
            phone: infoStaff.phone,
            joinDate: infoStaff.joinDate,
            status: infoStaff.status
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
        const { page, limit, search_value, from_date, to_date } = req.query;
        const managerRole = await Role.findOne({ name: "Manager" });
        if (!managerRole) {
            return res.status(404).json({ success: false, message: "Role 'Manager' không tồn tại." });
        }
        const query = { role: managerRole._id };
        if (search_value) {
            query.fullName = { $regex: search_value, $options: 'i' }; // Không phân biệt chữ hoa, chữ thường
        }

        // Thêm lọc theo createdDate nếu có
        if (from_date && to_date) {
            query.createdDate = { 
                $gte: new Date(from_date), 
                $lte: new Date(to_date).setHours(23, 59, 59, 999) 
            };
        }
        const accounts = await Account.find(query)
            .select("fullName email createdDate").lean()
            .skip((page - 1) * limit)
            .limit(Number(limit));
        const accountIds = accounts.map(account => account._id);
        const infoStaffs = await InfoStaff.find({ account: { $in: accountIds } })
        .populate("account", "fullName email createdDate").populate({
            path: "avatar",
            select: "url"
        })
        .lean();
        const result = infoStaffs.map(infoStaff => ({
            accountId: infoStaff.account._id,
            avatar: infoStaff.avatar,
            fullName: infoStaff.account.fullName,
            email: infoStaff.account.email,
            staffCode: infoStaff.staffCode,
            phone: infoStaff.phone,
            joinDate: infoStaff.joinDate,
            status: infoStaff.status,
            createdDate: infoStaff.account.createdDate
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