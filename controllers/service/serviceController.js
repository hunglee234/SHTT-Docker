const Service = require("../../models/Service/Service");
const Account = require("../../models/Account/Account");
const CategoryService = require("../../models/Service/CategoryService");
const User = require("../../models/User/User");
const RegisteredService = require("../../models/Service/RegisteredService");
const InfoUser = require("../../models/User/InfoUser");
const Record = require("../../models/Service/Record");
const mongoose = require("mongoose");
const Profile = require("../../models/Service/Profile");
const Image = require("../../models/image");
const Process = require("../../models/Process");
// CREATE
exports.createService = async (req, res) => {
  try {
    const {
      serviceName,
      description,
      notes,
      image,
      category,
      serviceCode,
      price,
    } = req.body;

    const userId = req.user.id;
    const account = await Account.findById(userId).populate("role");
    const defaultstatus = await Role.findOne({ name: "Đang hoạt động" });

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    if (!account.role || account.role.name !== "Admin") {
      return res
        .status(403)
        .json({ error: "Permission denied. User is not an Admin." });
    }

    // Đầu vào của category là id
    const categoryData = await CategoryService.findById(category);
    if (!categoryData) {
      return res
        .status(404)
        .json({ error: `Category with id '${category}' not found.` });
    }

    const createdBy = account._id;
    const newService = new Service({
      status: defaultstatus,
      serviceCode,
      price,
      serviceName,
      category: categoryData._id,
      description,
      notes,
      image: image || null,
      createdBy,
    });

    const savedService = await newService.save();
    res.status(201).json({
      message: "Service created successfully",
      data: savedService,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// READ ALL
exports.getAllServices = async (req, res) => {
  try {
    const { search_value } = req.query;

    // Khởi tạo query để tìm kiếm
    let serviceQuery = {};

    if (search_value) {
      serviceQuery.$text = { $search: search_value };
    }
    const services = await Service.find(serviceQuery);
    if (!services || services.length === 0) {
      return res.status(404).json({ message: "No services found" });
    }

    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// READ SINGLE
exports.getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id).populate("category");

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json(service);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid service ID" });
    }

    res.status(500).json({ error: error.message });
  }
};

// UPDATE
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      serviceName,
      description,
      notes,
      image,
      serviceCode,
      price,
    } = req.body;

    const userId = req.user.id;
    const account = await Account.findById(userId).populate("role");

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    // Kiểm tra vai trò của tài khoản
    const role = account.role;
    if (!role || role.name !== "Admin") {
      return res
        .status(403)
        .json({ error: "Permission denied. User is not an Admin." });
    }

    // Đầu vào của category là id
    // const categoryData = await CategoryService.findById(category);
    // if (!categoryData) {
    //   return res
    //     .status(404)
    //     .json({ error: `Category with id '${category}' not found.` });
    // }

    const updatedBy = account._id;
    console.log(updatedBy);
    const updatedService = await Service.findByIdAndUpdate(
      id,
      {
        status,
        serviceCode,
        price,
        serviceName,
        description,
        notes,
        image: image || null,
        updatedBy,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!updatedService) {
      return res.status(404).json({ error: "Service not found" });
    }

    res.status(200).json({
      message: "Service updated successfully",
      data: updatedService,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid service ID" });
    }

    res.status(500).json({ error: error.message });
  }
};

// DELETE
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const userId = req.user.id;
    const account = await Account.findById(userId).populate("role");

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    if (!account.role || account.role.name !== "Admin") {
      return res
        .status(403)
        .json({ error: "Permission denied. User is not an Admin." });
    }

    const deletedService = await Service.findByIdAndDelete(id);

    if (!deletedService) {
      return res.status(404).json({ error: "Service not found" });
    }

    res.status(200).json({
      message: "Service deleted successfully",
      data: deletedService,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid service ID" });
    }

    res.status(500).json({ error: error.message });
  }
};

// Chức năng cho User, Manager, Nhân viên, cộng tác viên

// Thêm Form Đăng Ký vào Schema
exports.registerService = async (req, res) => {
  const { serviceId } = req.params;
  const { info, image } = req.body;
  const createdUserId = req.user.id;
  if (!mongoose.Types.ObjectId.isValid(serviceId)) {
    return res.status(400).json({ message: "ID dịch vụ không hợp lệ!" });
  }

  try {
    // Tìm dịch vụ
    const service = await Service.findById(serviceId).populate("createdBy");
    if (!service) {
      return res.status(404).json({ message: "Dịch vụ không tồn tại!" });
    }

    const managerUserId = service.createdBy?._id;
    if (!managerUserId) {
      return res
        .status(500)
        .json({ message: "Không tìm thấy thông tin người quản lý dịch vụ!" });
    }
    // Tạo tài liệu RegisteredService
    const newService = new RegisteredService({
      serviceId: service._id,
      managerUserId,
      createdUserId,
      createdAt: new Date(),
    });
    const savedService = await newService.save(); // đợi kết quả trả về từ cơ sở dữ liệu và lưu vào savedService

    // Tạo hồ sơ mới
    // phải thêm serviceId vào newProfile
    const newProfile = new Profile({
      registeredService: savedService._id,
      serviceId,
      info,
      createdBy: createdUserId,
      image: image || null,
      createdAt: new Date(),
    });
    const savedProfile = await newProfile.save();

    // Tạo bản ghi lịch sử chỉnh sửa (Record)
    const initialRecord = new Record({
      profileId: savedProfile._id,
      status: "pending", // Mặc định trạng thái khi tạo mới
      recordType: "Đơn đăng ký",
    });
    const savedRecord = await initialRecord.save();
    // Cập nhật hồ sơ với thông tin record
    savedProfile.record.push(savedRecord._id);
    await savedProfile.save();

    const fullProfile = await Profile.findById(savedProfile._id)
      .populate({
        path: "serviceId", // Tham chiếu đến Service
        select: "id serviceName description category",
        populate: {
          path: "category", // Tham chiếu đến Category trong Service
          select: "categoryName description",
        },
      })
      .populate({
        path: "registeredService",
        select: "createdUserId",
        populate: {
          path: "createdUserId", // Tham chiếu đến Category trong Service
          select: "fullName",
        },
      })
      .populate({
        path: "image",
        select: "fileUrl",
      })
      .select("_id status");
    // Kiểm tra nếu không tìm thấy profile
    if (!fullProfile) {
      return res.status(404).json({
        message: "Không tìm thấy hồ sơ với ID được cung cấp.",
      });
    }

    return res.status(201).json({
      message: "Đăng ký dịch vụ và tạo hồ sơ thành công!",
      data: fullProfile,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Có lỗi xảy ra, vui lòng thử lại sau!" });
  }
};

// Update 09/01/2025 updateProfile Info
// exports.updateProfileInfo = async (req, res) => {
//   try {
//     const { profileId, serviceId, updatedInfo } = req.body;
//     const userId = req.userId; // Giả định userId được gắn vào request từ middleware xác thực

//     // Tìm hồ sơ theo profileId và serviceId
//     const profile = await Profile.findOne({
//       _id: profileId,
//       serviceId,
//     }).populate("record");

//     if (!profile) {
//       return res
//         .status(404)
//         .json({ message: "Hồ sơ hoặc dịch vụ không tồn tại" });
//     }

//     // Lấy dữ liệu hiện tại của `info` để so sánh
//     const oldInfo = profile.info;

//     // Khởi tạo danh sách thay đổi
//     const changes = [];

//     // Lặp qua các phần tử `info` để so sánh và cập nhật
//     updatedInfo.forEach((newInfo) => {
//       const oldInfoSection = oldInfo.find(
//         (section) => section.type === newInfo.type
//       );
//       if (!oldInfoSection) return;

//       newInfo.fields.forEach((newField) => {
//         const oldField = oldInfoSection.fields.find(
//           (field) => field.name === newField.name
//         );
//         if (!oldField || oldField.value === newField.value) return;

//         // Ghi nhận thay đổi
//         changes.push({
//           type: newInfo.type,
//           fieldName: newField.name,
//           oldValue: oldField.value,
//           newValue: newField.value,
//         });

//         // Cập nhật giá trị trong `info`
//         oldField.value = newField.value;
//       });
//     });

//     // Nếu không có thay đổi, trả về phản hồi
//     if (changes.length === 0) {
//       return res
//         .status(200)
//         .json({ message: "Không có thay đổi nào được thực hiện" });
//     }

//     // Kiểm tra xem đã có Record hay chưa
//     let record = await Record.findOne({ profileId });

//     if (record) {
//       // Cập nhật các thay đổi vào Record hiện tại
//       record.changes.push(...changes);
//       record.updatedAt = new Date();
//       await record.save();
//     } else {
//       // Tạo Record mới nếu chưa tồn tại
//       record = new Record({
//         profileId,
//         userId,
//         changes,
//         updatedAt: new Date(),
//       });
//       await record.save();

//       // Thêm record mới vào profile
//       profile.record.push(record._id);
//     }

//     // Lưu hồ sơ đã cập nhật
//     await profile.save();

//     // Trả về phản hồi
//     res.status(200).json({
//       message: "Cập nhật thành công",
//       changes,
//       updatedProfile: profile,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: "Đã xảy ra lỗi khi cập nhật hồ sơ dịch vụ",
//       error: error.message,
//     });
//   }
// };

// Lấy danh sách dịch vụ
// Nhân viên xem được các dịch vụ mình chịu trách nhiệm
// User xem được dịch vụ mình đăng ký
// Manager và Admin xem được hết
exports.getServiceList = async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  if (!userId) {
    return res.status(400).json({ message: "Thiếu userId trong yêu cầu!" });
  }

  try {
    // Truy vấn danh sách dịch vụ mà userId đã đăng ký với phân trang
    const userServices = await RegisteredService.find({
      createdUserId: userId,
    })
      .skip(skip) // Giới hạn số lượng bản ghi trả về
      .populate({
        path: "serviceId",
        populate: {
          path: "category",
          select: "categoryName",
        },
      });

    // Lấy tổng số dịch vụ để tính tổng số trang
    const totalServices = await RegisteredService.countDocuments({
      createdUserId: userId,
    });

    // Tính tổng số trang
    const totalPages = Math.ceil(totalServices / limit);

    return res.status(200).json({
      message: "Danh sách dịch vụ của bạn:",
      data: userServices,
      pagination: {
        currentPage: page,
        totalPages,
        totalServices,
        limit,
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Có lỗi xảy ra, vui lòng thử lại sau!" });
  }
};

// Chi tiết Hồ sơ
exports.getProfileDetails = async (req, res) => {
  const { profileId } = req.params;
  const userId = req.user.id;
  console.log(profileId);
  try {
    // Tìm Profile theo profileId và lọc các dịch vụ của userId trong registeredService
    const profile = await Profile.findOne({ _id: profileId }).populate([
      {
        path: "registeredService",
        match: { createdUserId: userId },
        populate: {
          path: "serviceId",
          select: "serviceName description",
        },
      },
      {
        path: "processes",
        select: "processContent completionDate documents",
      },
    ]);

    console.log(profile);
    // Kiểm tra nếu không tìm thấy Profile hoặc RegisteredService
    if (!profile || !profile.registeredService) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy hồ sơ hoặc dịch vụ của người dùng!" });
    }

    // Trả về thông tin chi tiết Profile và dịch vụ
    return res.status(200).json({
      message: "Thông tin chi tiết hồ sơ và dịch vụ:",
      data: profile,
    });
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết hồ sơ:", error.message);

    // Xử lý lỗi và trả về thông báo phù hợp
    return res.status(500).json({
      message: "Có lỗi xảy ra, vui lòng thử lại sau!",
    });
  }
};

// Manager chỉ xóa được đăng ký dịch vụ của khách
// Xóa dịch vụ
exports.deleteServiceCustomer = (req, res) => {
  const { serviceId } = req.params;

  const serviceIndex = services.findIndex((s) => s.id === parseInt(serviceId));

  if (serviceIndex === -1) {
    return res.status(404).json({ message: "Không tìm thấy dịch vụ!" });
  }

  const deletedService = services.splice(serviceIndex, 1);

  return res.status(200).json({
    message: "Xóa dịch vụ thành công!",
    data: deletedService,
  });
};

// Xem lịch sử chỉnh sửa hồ sơ đăng ký dịch vụ
exports.getEditHistory = async (req, res) => {
  try {
    const { profileId } = req.params;

    // Tìm tất cả các record dựa trên profileId
    const records = await Record.find({ profileId })
      .sort({ updatedAt: -1 }) // Sắp xếp từ mới nhất đến cũ nhất
      .lean(); // Trả về dữ liệu dạng plain object

    // console.log(records[1].status);
    console.log(`Profile ID: ${profileId}, Record length: ${records.length}`);

    if (!records || records.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy lịch sử chỉnh sửa cho hồ sơ này",
      });
    }

    // Trả về kết quả bao gồm số lượng record
    res.status(200).json({
      message: "Lấy lịch sử chỉnh sửa thành công",
      recordCount: records.length, // Thêm số lượng bản ghi
      history: records,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Đã xảy ra lỗi khi lấy lịch sử chỉnh sửa",
      error: error.message,
    });
  }
};
