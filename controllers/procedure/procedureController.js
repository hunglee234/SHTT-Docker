const Procedure = require("../../models/Procedure");

// Thêm thủ tục
exports.createProcedure = async (req, res) => {
  const { name, pdfUrl } = req.body;
  try {
    const procedure = await Procedure.create({ name, pdfUrl });
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
  const { name, pdfUrl } = req.body;
  try {
    const procedure = await Procedure.findByIdAndUpdate(
      procedureId,
      { name, pdfUrl },
      { new: true }
    );
    if (!procedure) {
      return res.status(404).json({ message: "Không tìm thấy thủ tục!" });
    }
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
  try {
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
    const procedures = await Procedure.find();
    res.status(200).json({ message: "Danh sách thủ tục:", data: procedures });
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
    const procedure = await Procedure.findById(procedureId);
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
