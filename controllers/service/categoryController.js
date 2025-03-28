const CategoryService = require("../../models/Service/CategoryService");
const Service = require("../../models/Service/Service");
const Account = require("../../models/Account/Account");
const { saveFile } = require("../../utils/saveFile");
exports.createCategory = async (req, res) => {
  try {
    const { categoryName, description } = req.body;

    let imageId = null;
    if (req.file) {
      const imageUrl = req.file.location;
      const fileType = req.file.mimetype.includes("image") ? "image" : "pdf";

      imageId = await saveFile(imageUrl, fileType);
    }
    // Lấy thông tin tài khoản từ req.user (đã được middleware authenticateToken gắn vào)
    const userId = req.user.id;

    // Tìm thông tin tài khoản Admin dựa trên userId
    const account = await Account.findById(userId).populate("role");
    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    // Kiểm tra vai trò của tài khoản
    const role = account.role;
    if (!role || (role.name !== "Admin" && role.name !== "SuperAdmin")) {
      return res
        .status(403)
        .json({ error: "Bạn không có quyền tạo loại dịch vụ" });
    }

    // Kết hợp tên admin và vai trò
    const createdBy = account._id;
    // Tạo danh mục với thông tin người tạo là tên admin + vai trò
    const newCategory = new CategoryService({
      categoryName,
      description,
      image: imageId || null,
      createdBy,
    });

    const savedCategory = await newCategory.save();
    const savedCategoryWithImage = await CategoryService.findById(
      savedCategory._id
    ).populate({
      path: "image",
      select: "url",
    });

    res.status(201).json({
      message: "Category created successfully",
      data: savedCategoryWithImage,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// READ ALL
exports.getAllCategory = async (req, res) => {
  try {
    const { search_value, page = 1, limit = 10 } = req.query;

    let categoryQuery = {};
    if (search_value) {
      categoryQuery.$text = { $search: search_value };
    }
    const skip = (page - 1) * limit;
    const categories = await CategoryService.find(categoryQuery)
      .populate({
        path: "image",
        select: "url",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean()
      .exec();
    const totalCategories = await CategoryService.countDocuments(categoryQuery);

    if (!categories || categories.length === 0) {
      return res.status(404).json({ message: "No categories found" });
    }

    const totalPages = Math.ceil(totalCategories / limit);

    // Lấy danh sách dịch vụ cho từng category
    const categoriesWithServices = await Promise.all(
      categories.map(async (category) => {
        // Tìm các dịch vụ liên quan đến category
        const services = await Service.find({ category: category._id });

        return {
          id: category._id,
          name: category.categoryName,
          description: category.description,
          image: category.image?.url || null,
          services: services.map((service) => ({
            id: service._id,
            name: service.serviceName,
            price: service.price,
            description: service.description,
            formName: service.formName,
          })),
        };
      })
    );

    res.status(200).json({
      currentPage: page,
      totalPages: totalPages,
      totalCategories: totalCategories,
      categories: categoriesWithServices,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// READ SINGLE
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await CategoryService.findById(id).populate({
      path: "image",
      select: "url",
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Kiểm tra role của user
    const isAdmin = req.user && ["Admin", "SuperAdmin"].includes(req.user.role);

    // Điều kiện lọc dịch vụ
    let serviceQuery = { category: category._id };
    if (!isAdmin) {
      serviceQuery.status = "Đang hoạt động"; // User thường chỉ thấy dịch vụ đang hoạt động
    }

    // Tìm các dịch vụ liên quan đến category
    const services = await Service.find(serviceQuery);

    // Lấy danh sách dịch vụ cho từng category
    const categoryWithServices = {
      id: category._id,
      name: category.categoryName,
      description: category.description,
      image: category.image?.url || null,
      services: services.map((service) => ({
        id: service._id,
        name: service.serviceName,
        price: service.price,
        description: service.description,
        formName: service.formName,
      })),
    };

    res.status(200).json(categoryWithServices);
  } catch (error) {
    console.error("Error fetching category by ID:", error.message);

    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid category ID" });
    }

    res.status(500).json({ error: "Internal server error" });
  }
};

// UPDATE
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryName, description } = req.body;

    const existingCategory = await CategoryService.findById(id);
    if (!existingCategory) {
      return res.status(404).json({ error: "Service not found" });
    }

    let imageId = existingCategory.image;
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
    if (!role || (role.name !== "Admin" && role.name !== "SuperAdmin")) {
      return res
        .status(403)
        .json({ error: "Bạn không có quyền cập nhật loại dịch vụ" });
    }

    // Kết hợp tên admin và vai trò cho updatedBy
    const updatedBy = account._id;

    // Cập nhật danh mục
    const updatedCategory = await CategoryService.findByIdAndUpdate(
      id,
      {
        categoryName,
        description,
        image: imageId,
        updatedBy,
      },
      { new: true, runValidators: true } // Trả về document mới nhất sau khi cập nhật
    );

    // Kiểm tra nếu không tìm thấy danh mục
    if (!updatedCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    const updatedCategoryFinal = await CategoryService.findById(
      updatedCategory._id
    ).populate({
      path: "image",
      select: "url",
    });

    // Trả về danh mục đã được cập nhật
    res.status(200).json({
      message: "Category updated successfully",
      data: updatedCategoryFinal,
    });
  } catch (error) {
    console.error("Error updating category:", error.message);

    // Xử lý lỗi nếu ID không hợp lệ
    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid category ID" });
    }

    // Xử lý các lỗi khác
    res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params; // Lấy ID từ params

    // Lấy thông tin tài khoản từ req.user (đã được middleware authenticateToken gắn vào)
    const userId = req.user.id;

    // Tìm thông tin tài khoản Admin dựa trên userId
    const account = await Account.findById(userId).populate("role");
    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    // Kiểm tra vai trò của tài khoản
    const role = account.role;
    if (!role || role.name !== "SuperAdmin") {
      return res
        .status(403)
        .json({ error: "Bạn không có quyền xóa loại dịch vụ" });
    }

    // Xóa danh mục
    const deletedCategory = await CategoryService.findByIdAndDelete(id);

    // Kiểm tra nếu không tìm thấy danh mục
    if (!deletedCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Trả về phản hồi thành công
    res.status(200).json({
      message: "Category deleted successfully",
      data: deletedCategory,
    });
  } catch (error) {
    console.error("Error deleting category:", error.message);

    // Xử lý lỗi nếu ID không hợp lệ
    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid category ID" });
    }

    // Xử lý các lỗi khác
    res.status(500).json({ error: "Internal server error" });
  }
};
