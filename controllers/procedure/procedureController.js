const mongoose = require("mongoose");
const dayjs = require("dayjs");
const Procedure = require("../../models/Procedure");
const Account = require("../../models/Account/Account");
// Thêm thủ tục
exports.createProcedure = async (req, res) => {
  try {
    const { nameProce, categoryId, submissionTime, reviewTime } = req.body;
    const txtFile = req.files["txtFile"]
      ? req.files["txtFile"][0].location
      : null;

    const otherFile = req.files["File"] ? req.files["File"][0].location : null;

    // Kiểm tra và chuyển đổi categoryId thành ObjectId hợp lệ hoặc null
    const validCategoryId = mongoose.Types.ObjectId.isValid(categoryId)
      ? new mongoose.Types.ObjectId(categoryId)
      : null;

    const procedure = await Procedure.create({
      name: nameProce,
      txtUrl: txtFile,
      fileUrl: otherFile,
      categoryId: validCategoryId,
      submissionTime,
      reviewTime,
    });
    res
      .status(201)
      .json({ message: "Thủ tục được tạo thành công!", data: procedure });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi tạo thủ tục!", error: error.message });
  }
};

// Sửa thủ tục
exports.updateProcedure = async (req, res) => {
  const { procedureId } = req.params;
  const { nameProce, categoryId, submissionTime, reviewTime } = req.body;
  const txtFile = req.files["txtFile"]
    ? req.files["txtFile"][0].location
    : null;

  const otherFile = req.files["File"] ? req.files["File"][0].location : null;

  // Kiểm tra và chuyển đổi categoryId thành ObjectId hợp lệ hoặc null
  const validCategoryId = mongoose.Types.ObjectId.isValid(categoryId)
    ? new mongoose.Types.ObjectId(categoryId)
    : null;

  try {
    const currentProcedure = await Procedure.findById(procedureId);
    if (!currentProcedure) {
      return res.status(404).json({ message: "Không tìm thấy thủ tục!" });
    }

    const updatedData = {
      name: nameProce || currentProcedure.name,
      txtUrl: txtFile || currentProcedure.txtUrl,
      fileUrl: otherFile || currentProcedure.fileUrl,
      categoryId: validCategoryId || currentProcedure.categoryId,
      submissionTime: submissionTime || currentProcedure.submissionTime,
      reviewTime: reviewTime || currentProcedure.reviewTime,
    };

    const procedure = await Procedure.findByIdAndUpdate(
      procedureId,
      updatedData,
      { new: true }
    );
    res
      .status(200)
      .json({ message: "Thủ tục được cập nhật thành công!", data: procedure });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi cập nhật thủ tục!", error: error.message });
  }
};

// Xóa thủ tục
exports.deleteProcedure = async (req, res) => {
  const { procedureId } = req.params;
  const userId = req.user.id;
  try {
    const account = await Account.findById(userId).populate("role");

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    if (!account.role || account.role.name !== "SuperAdmin") {
      return res.status(403).json({ error: "Bạn không có quyền xóa thủ tục" });
    }
    const procedure = await Procedure.findByIdAndDelete(procedureId);
    if (!procedure) {
      return res.status(404).json({ message: "Không tìm thấy thủ tục!" });
    }
    res.status(200).json({ message: "Thủ tục đã được xóa thành công!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi xóa thủ tục!", error: error.message });
  }
};

// Xem danh sách thủ tục
exports.getAllProcedures = async (req, res) => {
  try {
    const { search_value, page = 1, limit = 10 } = req.query;
    let procedureQuery = {};

    if (
      search_value &&
      search_value.trim() !== "" &&
      search_value.trim() !== '""'
    ) {
      const cleanSearchValue = search_value.replace(/"/g, "").trim();
      procedureQuery.name = { $regex: cleanSearchValue, $options: "i" };
    }

    const skip = (page - 1) * limit;
    const procedures = await Procedure.find(procedureQuery)
      .populate("categoryId", "categoryName")
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(parseInt(limit));

    const totalProcedures = await Procedure.countDocuments(procedureQuery);
    const totalPages = Math.ceil(totalProcedures / limit);

    res.status(200).json({
      message: "Danh sách thủ tục:",
      data: {
        currentPage: page,
        totalPages: totalPages,
        totalProcedures: totalProcedures,
        procedures: procedures,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách thủ tục!",
      error: error.message,
    });
  }
};

// Xem chi tiết thủ tục theo ID
exports.getProcedureDetails = async (req, res) => {
  const { procedureId } = req.params;
  try {
    const procedure = await Procedure.findById(procedureId).populate(
      "categoryId",
      "categoryName"
    );
    if (!procedure) {
      return res.status(404).json({ message: "Không tìm thấy thủ tục!" });
    }
    res
      .status(200)
      .json({ message: "Thông tin chi tiết thủ tục:", data: procedure });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy chi tiết thủ tục!", error: error.message });
  }
};

// Xem danh sách thủ tục dựa theo categoryID
exports.getProceduresByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    let { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Kiểm tra nếu categoryId không hợp lệ
    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu Category ID",
      });
    }

    const procedureQuery = { categoryId };
    const totalProcedures = await Procedure.countDocuments(procedureQuery);

    if (totalProcedures === 0) {
      return res.status(404).json({
        success: false,
        message: "Không có thủ tục nào trong danh mục này",
      });
    }

    const procedures = await Procedure.find(procedureQuery)
      .populate("categoryId", "categoryName")
      .skip(skip)
      .limit(parseInt(limit));

    const totalPages = Math.ceil(totalProcedures / limit);
    res.status(200).json({
      message: "Danh sách thủ tục theo CategoryID",
      data: {
        currentPage: page,
        totalPages: totalPages,
        totalProcedures: totalProcedures,
        procedures: procedures,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách thủ tục",
      error,
    });
  }
};
