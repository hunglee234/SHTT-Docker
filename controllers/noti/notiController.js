const Noti = require("../../models/Noti");
const Profile = require("../../models/Service/Profile");
const RegisteredService = require("../../models/Service/RegisteredService");
// Lấy danh sách thông báo
exports.getNotiList = async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;
  const { page = 1, limit = 10 } = req.query;
  try {
    // Manager sẽ nhận được thông báo của tất cả các hồ sơ mà mình quản lý
    // Staff và Collaborator chỉ nhận được thông báo hồ sơ của mình thôi
    let filter = {};
    let registeredServiceIds = [];

    if (userRole === "Manager") {
      const managedServices = await RegisteredService.find({
        $or: [{ managerUserId: userId }, { createdUserId: userId }],
      });
      const managedServiceIds = managedServices.map((service) => service._id);

      // Lọc các hồ sơ mà manager quản lý hoặc họ tạo
      filter = {
        $or: [
          { registeredService: { $in: managedServiceIds } },
          { createdBy: userId },
        ],
      };
    } else if (userRole === "Staff" || userRole === "Collaborator") {
      const listRegisteredServices = await RegisteredService.find({
        createdUserId: userId,
      });

      registeredServiceIds = listRegisteredServices.map(
        (service) => service._id
      );

      filter = { registeredService: { $in: registeredServiceIds } };
    }

    const listProfile = await Profile.find(filter).select("_id"); // Chỉ lấy ID của profile
    const profileIds = listProfile.map((profile) => profile._id); // Lấy danh sách ID

    // Đếm số lượng thông báo mới
    const newNotiCount = await Noti.countDocuments({
      profileId: { $in: profileIds },
      status: "New",
    });

    const notiList = await Noti.find({ profileId: { $in: profileIds } }) // Sử dụng profileIds trong điều kiện
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .exec();

    // Cập nhật trạng thái "read" cho các thông báo đã lấy
    if (notiList.length > 0) {
      await Noti.updateMany(
        { _id: { $in: notiList.map((noti) => noti._id) } },
        { $set: { status: "Read" } }
      );
    }
    const totalNoti = await Noti.countDocuments({
      profileId: { $in: profileIds },
    });

    return res.status(200).json({
      message: "Danh sách thông báo",
      data: notiList,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalNoti / limit),
        totalNoti,
        newNotiCount,
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách thông báo:", error.message);
    return res.status(500).json({ message: "Lỗi khi lấy danh sách thông báo" });
  }
};

// Lấy chi tiết thông báo
exports.getNotiDetail = async (req, res) => {
  const { notiId } = req.params; // Lấy notiId từ URL

  try {
    const notiDetail = await Noti.findById(notiId).populate(
      "profileId",
      "name email"
    ); // Populate thông tin profile

    if (!notiDetail) {
      return res.status(404).json({ message: "Không tìm thấy thông báo" });
    }

    return res.status(200).json({
      message: "Chi tiết thông báo",
      data: notiDetail,
    });
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết thông báo:", error.message);
    return res.status(500).json({ message: "Lỗi khi lấy chi tiết thông báo" });
  }
};

// Lấy số lượng thông báo mới
exports.getNewNotiCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    let filter = {};

    if (userRole === "Manager") {
      const managedServices = await RegisteredService.find({
        $or: [{ managerUserId: userId }, { createdUserId: userId }],
      });
      const managedServiceIds = managedServices.map((service) => service._id);

      filter = {
        $or: [
          { registeredService: { $in: managedServiceIds } },
          { createdBy: userId },
        ],
      };
    } else {
      const listRegisteredServices = await RegisteredService.find({
        createdUserId: userId,
      });

      const registeredServiceIds = listRegisteredServices.map(
        (service) => service._id
      );

      filter = { registeredService: { $in: registeredServiceIds } };
    }

    const listProfile = await Profile.find(filter).select("_id");
    const profileIds = listProfile.map((profile) => profile._id);

    const newNotiCount = await Noti.countDocuments({
      profileId: { $in: profileIds },
      status: "New",
    });

    return res
      .status(200)
      .json({ message: "Số lượng thông báo mới", newNotiCount });
  } catch (error) {
    console.error("Lỗi khi lấy số lượng thông báo mới:", error.message);
    return res
      .status(500)
      .json({ message: "Lỗi khi lấy số lượng thông báo mới" });
  }
};
