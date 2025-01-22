const Document = require("../../models/Documents");
const Account = require("../../models/Account/Account");
// Thêm thủ tục
exports.createDocument = async (req, res) => {
  try {
    const nameDocument = req.body.name || [];
    const pdfFile = req.file || {};
    const pdfId = pdfFile.location;
    const Documents = await Document.create({
      name: nameDocument,
      pdfUrl: pdfId,
    });
    res
      .status(201)
      .json({ message: "Tài liệu được tạo thành công!", data: Documents });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi tạo tài liệu!", error: error.message });
  }
};

// Sửa thủ tục
exports.updateDocument = async (req, res) => {
  const { documentId } = req.params;
  const nameProce = req.body.name;
  const pdfFile = req.file || {};
  const pdfId = pdfFile.location || null;
  try {
    const currentDocument = await Document.findById(documentId);
    if (!currentDocument) {
      return res.status(404).json({ message: "Không tìm thấy thủ tục!" });
    }

    const updatedData = {
      name: nameProce || currentDocument.name,
      pdfUrl: pdfId || currentDocument.pdfUrl,
    };

    const Documents = await Document.findByIdAndUpdate(
      documentId,
      updatedData,
      { new: true }
    );

    res
      .status(200)
      .json({ message: "Thủ tục được cập nhật thành công!", data: Documents });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi cập nhật thủ tục!", error: error.message });
  }
};

// Xóa thủ tục
exports.deleteDocument = async (req, res) => {
  const { documentId } = req.params;
  const userId = req.user.id;
  try {
    const account = await Account.findById(userId).populate("role");
    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    if (!account.role || account.role.name !== "SuperAdmin") {
      return res.status(403).json({ error: "Bạn không có quyền xóa thủ tục" });
    }
    const Documents = await Document.findByIdAndDelete(documentId);
    if (!Documents) {
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
exports.getAllDocuments = async (req, res) => {
  try {
    const { search_value, page = 1, limit = 10 } = req.query;
    let DocumentQuery = {};

    if (
      search_value &&
      search_value.trim() !== "" &&
      search_value.trim() !== '""'
    ) {
      const cleanSearchValue = search_value.replace(/"/g, "").trim();
      DocumentQuery.name = { $regex: cleanSearchValue, $options: "i" };
    }

    const skip = (page - 1) * limit;
    const Documents = await Document.find(DocumentQuery)
      .skip(skip)
      .limit(parseInt(limit));

    const totalDocuments = await Document.countDocuments(DocumentQuery);
    const totalPages = Math.ceil(totalDocuments / limit);

    res.status(200).json({
      message: "Danh sách tài liệu:",
      data: {
        currentPage: page,
        totalPages: totalPages,
        totalDocuments: totalDocuments,
        documents: Documents,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách tài liệu!",
      error: error.message,
    });
  }
};

// Xem chi tiết thủ tục theo ID
exports.getDocumentDetails = async (req, res) => {
  const { documentId } = req.params;
  try {
    const Documents = await Document.findById(documentId);
    if (!Documents) {
      return res.status(404).json({ message: "Không tìm thấy thủ tục!" });
    }
    res
      .status(200)
      .json({ message: "Thông tin chi tiết thủ tục:", data: Documents });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy chi tiết thủ tục!", error: error.message });
  }
};
