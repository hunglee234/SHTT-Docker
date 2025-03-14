const Document = require("../../models/Documents");
const Account = require("../../models/Account/Account");
// Thêm tài liệu
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

// Sửa tài liệu
exports.updateDocument = async (req, res) => {
  const { documentId } = req.params;
  const nameDocument = req.body.name;
  const pdfFile = req.file || {};
  const pdfId = pdfFile.location || null;
  try {
    const currentDocument = await Document.findById(documentId);
    if (!currentDocument) {
      return res.status(404).json({ message: "Không tìm thấy tài liệu!" });
    }

    const updatedData = {
      name: nameDocument || currentDocument.name,
      pdfUrl: pdfId || currentDocument.pdfUrl,
    };

    const Documents = await Document.findByIdAndUpdate(
      documentId,
      updatedData,
      { new: true }
    );

    res
      .status(200)
      .json({ message: "Tài liệu được cập nhật thành công!", data: Documents });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi cập nhật tài liệu!", error: error.message });
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
      return res.status(403).json({ error: "Bạn không có quyền xóa bài viết" });
    }
    const Documents = await Document.findByIdAndDelete(documentId);
    if (!Documents) {
      return res.status(404).json({ message: "Không tìm thấy bài viết!" });
    }
    res.status(200).json({ message: "Bài viết đã được xóa thành công!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi xóa bài viết!", error: error.message });
  }
};

// Xem danh sách thủ tục
exports.getAllDocuments = async (req, res) => {
  try {
    const { search_value } = req.query;
    let DocumentQuery = {};

    if (
      search_value &&
      search_value.trim() !== "" &&
      search_value.trim() !== '""'
    ) {
      const cleanSearchValue = search_value.replace(/"/g, "").trim();
      DocumentQuery.name = { $regex: cleanSearchValue, $options: "i" };
    }

    const Documents = await Document.find(DocumentQuery).sort({
      createdAt: -1,
    });

    res.status(200).json({
      message: "Danh sách tài liệu:",
      data: {
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
      return res.status(404).json({ message: "Không tìm thấy bài viết!" });
    }
    res
      .status(200)
      .json({ message: "Thông tin chi tiết bài viết:", data: Documents });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy chi tiết bài viết!",
      error: error.message,
    });
  }
};
