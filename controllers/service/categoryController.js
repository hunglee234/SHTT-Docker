const CategoryService = require("../../models/Service/CategoryService");
const Service = require("../../models/Service/Service");
const ManagerAccount = require("../../models/Account/InfoManager");
const Account = require("../../models/Account/Account");

exports.createCategory = async (req, res) => {
  try {
    const { categoryName, description, createdAt, image } = req.body;

    // Lấy thông tin tài khoản từ req.user (đã được middleware authenticateToken gắn vào)
    const userId = req.user.id;

    // Tìm thông tin tài khoản Admin dựa trên userId
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

    // Kết hợp tên admin và vai trò
    const createdBy = account._id;
    console.log();
    // Tạo danh mục với thông tin người tạo là tên admin + vai trò
    const newCategory = new CategoryService({
      categoryName,
      description,
      createdBy,
      image: image || null,
      createdAt: createdAt || new Date(),
    });

    const savedCategory = await newCategory.save();
    res.status(201).json({
      message: "Category created successfully",
      data: savedCategory,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// READ ALL
exports.getAllCategory = async (req, res) => {
  try {
    const categories = await CategoryService.find();
    if (!categories || categories.length === 0) {
      return res.status(404).json({ message: "No categories found" });
    }

    // Lấy danh sách dịch vụ cho từng category
    const categoriesWithServices = await Promise.all(
      categories.map(async (category) => {
        // Tìm các dịch vụ liên quan đến category
        const services = await Service.find({ category: category._id });

        return {
          id: category._id,
          name: category.categoryName,
          description: category.description,
          services: services.map((service) => ({
            id: service._id,
            name: service.serviceName,
            price: service.price,
            description: service.description,
          })),
        };
      })
    );

    res.status(200).json(categoriesWithServices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// READ SINGLE
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await CategoryService.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Tìm các dịch vụ liên quan đến category
    const services = await Service.find({ category: category._id });

    // Lấy danh sách dịch vụ cho từng category
    const categoryWithServices = {
      id: category._id,
      name: category.categoryName,
      description: category.description,
      services: services.map((service) => ({
        id: service._id,
        name: service.serviceName,
        price: service.price,
        description: service.description,
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
    const { categoryName, description, image } = req.body;

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

    // Kết hợp tên admin và vai trò cho updatedBy
    const updatedBy = account._id;

    // Cập nhật danh mục
    const updatedCategory = await CategoryService.findByIdAndUpdate(
      id,
      {
        categoryName,
        description,
        image: image || null,
        updatedBy,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true } // Trả về document mới nhất sau khi cập nhật
    );

    // Kiểm tra nếu không tìm thấy danh mục
    if (!updatedCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Trả về danh mục đã được cập nhật
    res.status(200).json({
      message: "Category updated successfully",
      data: updatedCategory,
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
    if (!role || role.name !== "Admin") {
      return res
        .status(403)
        .json({ error: "Permission denied. User is not an Admin." });
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
