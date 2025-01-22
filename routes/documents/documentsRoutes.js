const express = require("express");
const router = express.Router();
const DocumentController = require("../../controllers/documents/documentController");
const upload = require("../../utils/multer");
// Thêm tài liệu
router.post("/", upload.single("pdfFile"), DocumentController.createDocument);

// Sửa tài liệu
router.put(
  "/:documentId",
  upload.single("pdfFile"),
  DocumentController.updateDocument
);

// Xóa tài liệu
router.delete("/:documentId", DocumentController.deleteDocument);

// Xem danh sách tài liệu
router.get("/", DocumentController.getAllDocuments);

// Xem chi tiết tài liệu theo ID
router.get("/:documentId", DocumentController.getDocumentDetails);

module.exports = router;
