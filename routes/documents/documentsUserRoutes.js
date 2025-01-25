const express = require("express");
const router = express.Router();
const DocumentController = require("../../controllers/documents/documentController");
const upload = require("../../utils/multer");

// Xem danh sách tài liệu
router.get("/", DocumentController.getAllDocuments);

// Xem chi tiết tài liệu theo ID
router.get("/:documentId", DocumentController.getDocumentDetails);

module.exports = router;
