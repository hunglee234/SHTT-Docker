const Profile = require("../../models/Service/Profile");

exports.createProfile = async (req, res) => {
  const { serviceId, info, image } = req.body;

  const userId = req.user.id;
  const account = await Account.findById(userId).populate("role");

  if (!account) {
    return res.status(404).json({ error: "Account not found" });
  }

  // Kiểm tra vai trò
  const role = account.role;
  if (!role || role.name !== "Admin") {
    return res
      .status(403)
      .json({ error: "Permission denied. User is not an Admin." });
  }

  const createdBy = account._id;

  try {
    // Kiểm tra xem registeredService có tồn tại không
    const service = await Service.findById(serviceId);
    if (!service) {
      return res
        .status(404)
        .json({ message: "Dịch vụ đăng ký không tồn tại!" });
    }

    // Tạo hồ sơ mới
    const newProfile = new Profile({
      registeredService,
      info,
      createdBy,
      image: image || null,
      createdAt: new Date(),
      record,
    });

    const savedProfile = await newProfile.save();

    return res.status(201).json({
      message: "Tạo hồ sơ thành công!",
      data: savedProfile,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Có lỗi xảy ra trong quá trình tạo hồ sơ." });
  }
};
