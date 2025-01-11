const Service = require("../../models/Service/Service");
const Account = require("../../models/Account/Account");
const CategoryService = require("../../models/Service/CategoryService");
const User = require("../../models/User/User");
const RegisteredService = require("../../models/Service/RegisteredService");
const InfoUser = require("../../models/User/InfoUser");
const Record = require("../../models/Service/Record");
const mongoose = require("mongoose");
const Profile = require("../../models/Service/Profile");
const { saveFile } = require("../../utils/saveFile");

// CREATE
exports.createService = async (req, res) => {
  try {
    const {
      serviceName,
      description,
      notes,
      category: categoryname,
      serviceCode,
      price,
      status,
      formNumber,
    } = req.body;

    let imageId = null;
    if (req.file) {
      const imageUrl = req.file.location;
      const fileType = req.file.mimetype.includes("image") ? "image" : "pdf";

      imageId = await saveFile(imageUrl, fileType);
    }

    const userId = req.user.id;
    const account = await Account.findById(userId).populate("role");
    // const defaultstatus = await Role.findOne({ name: "Đang hoạt động" });

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    if (!account.role || account.role.name !== "Admin") {
      return res
        .status(403)
        .json({ error: "Permission denied. User is not an Admin." });
    }

    // check Category Name
    const categoryExists = await CategoryService.findOne({
      categoryName: categoryname,
    });

    if (!categoryExists) {
      return res.status(404).json({ error: "Loại dịch vụ không tồn tại." });
    }

    const createdBy = account._id;
    const newService = new Service({
      status,
      serviceCode,
      price,
      serviceName,
      category: categoryExists._id,
      description,
      notes,
      image: imageId || null,
      formNumber,
      createdBy,
    });

    const savedService = await newService.save();
    const serviceWithImage = await Service.findById(savedService._id).populate({
      path: "image",
      select: "url",
    });

    res.status(201).json({
      message: "Service created successfully",
      data: serviceWithImage,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// READ ALL
exports.getAllServices = async (req, res) => {
  try {
    const { search_value, page = 1, limit = 10 } = req.query;

    // Khởi tạo query để tìm kiếm
    let serviceQuery = {};

    if (search_value) {
      serviceQuery.$text = { $search: search_value };
    }
    const skip = (page - 1) * limit;
    const services = await Service.find(serviceQuery)
      .skip(skip)
      .limit(parseInt(limit))
      .populate({
        path: "image",
        select: "url",
      })
      .populate({
        path: "category",
        select: "categoryName",
      })
      .populate({
        path: "createdBy",
        select: "fullName",
      })
      .exec();
    const totalServices = await Service.countDocuments(serviceQuery);

    if (!services || services.length === 0) {
      return res.status(404).json({ message: "No services found" });
    }

    const totalPages = Math.ceil(totalServices / limit);

    res.status(200).json({
      currentPage: page,
      totalPages: totalPages,
      totalServices: totalServices,
      services: services,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// READ SINGLE
exports.getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id)
      .populate({
        path: "image",
        select: "url",
      })
      .populate({
        path: "category",
        select: "categoryName",
      })
      .populate({
        path: "createdBy",
        select: "fullName",
      })
      .populate({
        path: "updatedBy",
        select: "fullName",
      })
      .exec();

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
      serviceName,
      description,
      notes,
      category: categoryname,
      serviceCode,
      price,
      status,
    } = req.body;

    let imageId = null;
    if (req.file) {
      const imageUrl = req.file.location;
      const fileType = req.file.mimetype.includes("image") ? "image" : "pdf";

      imageId = await saveFile(imageUrl, fileType);
    }

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

    console.log(categoryname);
    // check Category Name
    const categoryExists = await CategoryService.findOne({
      categoryName: categoryname,
    });

    if (!categoryExists) {
      return res.status(404).json({ error: "Loại dịch vụ không tồn tại." });
    }

    const updatedBy = account._id;
    console.log(updatedBy);
    const updatedService = await Service.findByIdAndUpdate(
      id,
      {
        status,
        serviceCode,
        price,
        serviceName,
        category: categoryExists._id,
        description,
        notes,
        image: imageId || null,
        updatedBy,
      },
      { new: true, runValidators: true }
    );

    if (!updatedService) {
      return res.status(404).json({ error: "Service not found" });
    }

    const updatedServiceFinal = await Service.findById(
      updatedService._id
    ).populate({
      path: "image",
      select: "url",
    });

    res.status(200).json({
      message: "Service updated successfully",
      data: updatedServiceFinal,
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

// Đăng ký dịch vụ
exports.registerService = async (req, res) => {
  const { form } = req.params;
  const createdUserId = req.user.id;

  try {
    // Tìm dịch vụ
    const service = await Service.findOne({
      formNumber: form,
    }).populate("createdBy");
    // console.log("Tìm dịch vụ theo form ", service);
    if (!service) {
      return res.status(404).json({ message: "Dịch vụ không tồn tại!" });
    }
    // console.log("Đây là id dịch vụ theo form ", service._id);

    const infoData = JSON.parse(req.body.info || "[]");

    const galleryFiles = req.files.gallery || [];

    let imageId = null;
    if (req.files.image && req.files.image[0].mimetype.includes("image")) {
      const imageUrl = req.files.image[0].location; // Đảm bảo lấy đúng file từ trường "image"
      imageId = await saveFile(imageUrl, "image");
    }

    const responseObject = {
      info: infoData.map((infoItem) => ({
        type: infoItem.type,
        fields: infoItem.fields.map((field, index) => {
          if (field.fieldType === "text") {
            // Gán giá trị text vào các trường
            return {
              name: field.name,
              value: field.value,
              fieldType: field.fieldType,
            };
          } else if (field.fieldType === "image" || field.fieldType === "pdf") {
            // Xử lý file (ảnh hoặc pdf)
            const file = galleryFiles[index];
            return {
              name: field.name,
              value: file.location,
              fieldType: file.mimetype.startsWith("image") ? "image" : "pdf",
            };
          }
        }),
      })),
    };

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
      serviceId: service._id,
      info: responseObject.info,
      createdBy: createdUserId,
      image: imageId || null,
      createdAt: new Date(),
    });
    const savedProfile = await newProfile.save();

    console.log("Phần info trong Profile", savedProfile.info);
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
        select: "url",
      })
      .select("_id status info");

    console.log("hồ sơ đăng ký chi tiết", fullProfile);
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
exports.updateProfileInfo = async (req, res) => {
  try {
    const { profileId } = req.params;
    const userId = req.user.id;

    // Tìm hồ sơ theo profileId
    const profile = await Profile.findById(profileId).populate("record");

    if (!profile) {
      return res.status(404).json({ message: "Hồ sơ không tồn tại!" });
    }

    // Lấy dữ liệu hiện tại của `info`
    const oldInfo = profile.info;
    const updatedInfo = JSON.parse(req.body.info || "[]"); // Lấy thông tin mới từ request body

    const galleryFiles = req.files.gallery || [];

    let imageId = null;
    if (req.files.image && req.files.image[0].mimetype.includes("image")) {
      const imageUrl = req.files.image[0].location; // Đảm bảo lấy đúng file từ trường "image"
      imageId = await saveFile(imageUrl, "image");
    }

    const changes = [];

    // Lặp qua các phần tử `updatedInfo` để so sánh và cập nhật
    updatedInfo.forEach((newInfo) => {
      // console.log("Dữ liệu mới (newInfo):", newInfo);
      const oldInfoSection = oldInfo.find(
        (section) => section.type === newInfo.type
      );
      // console.log("dữ liệu cũ", oldInfoSection);
      if (!oldInfoSection) return;

      newInfo.fields.forEach((newField) => {
        const oldField = oldInfoSection.fields.find(
          (field) => field.name === newField.name
        );
        // Kiểm tra chi tiết giá trị mới
        console.log("Kiểm tra chi tiết giá trị mới", newField.value);
        if (!oldField || oldField.value === newField.value) return;

        // Ghi nhận thay đổi
        changes.push({
          type: newInfo.type,
          fieldName: newField.name,
          oldValue: oldField.value,
          newValue: newField.value,
        });
        // Cập nhật giá trị trong `info`
        oldField.value = newField.value;
      });
    });

    // Xử lý file mới và cập nhật gallery
    updatedInfo.forEach((newInfo) => {
      newInfo.fields.forEach((newField, index) => {
        if (newField.fieldType === "image" || newField.fieldType === "pdf") {
          const file = galleryFiles[index];
          if (file) {
            console.log(file);
            newField.value = file.location;
            console.log("file.location", file.location);
            console.log("newField.value", newField.value);
          }
        }
      });
    });

    // Nếu không có thay đổi, trả về phản hồi
    if (changes.length === 0 && !imageId && galleryFiles.length === 0) {
      return res
        .status(200)
        .json({ message: "Không có thay đổi nào được thực hiện" });
    }

    // Kiểm tra xem đã có Record hay chưa
    // let record = await Record.findOne({ profileId });

    // ĐÂY LÀ PHẦN SẼ UPDATE TÍNH NĂNG RECORD
    // if (record) {
    //   // Cập nhật các thay đổi vào Record hiện tại
    //   record.changes.push(...changes);
    //   record.updatedAt = new Date();
    //   await record.save();
    // } else {
    //   // Tạo Record mới nếu chưa tồn tại
    //   record = new Record({
    //     profileId,
    //     userId,
    //     changes,
    //     updatedAt: new Date(),
    //   });
    //   await record.save();

    //   // Thêm record mới vào profile
    //   profile.record.push(record._id);
    // }

    // Cập nhật lại thông tin của hồ sơ
    profile.info = updatedInfo;

    if (imageId) {
      profile.image = imageId;
    }

    // Lưu hồ sơ đã cập nhật
    await profile.save();

    const fullProFileWithImage = await Profile.findById(profile._id).populate({
      path: "image",
      select: "url",
    });

    // Trả về phản hồi
    res.status(200).json({
      message: "Cập nhật thành công",
      updatedProfile: fullProFileWithImage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Đã xảy ra lỗi khi cập nhật hồ sơ dịch vụ",
      error: error.message,
    });
  }
};

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
        select: "serviceName description",
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

    const fullProFileWithImage = await Profile.findById(profile._id).populate({
      path: "image",
      select: "url",
    });

    // Kiểm tra nếu không tìm thấy Profile hoặc RegisteredService
    if (!profile || !profile.registeredService) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy hồ sơ của người dùng!" });
    }

    // Trả về thông tin chi tiết Profile và dịch vụ
    return res.status(200).json({
      message: "Thông tin chi tiết hồ sơ và dịch vụ:",
      data: fullProFileWithImage,
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
