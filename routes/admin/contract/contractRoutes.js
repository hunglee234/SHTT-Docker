const express = require("express");
const router = express.Router();
const ContractController = require("../../../controllers/contract/contractController");
const upload = require("../../../utils/multer");
// Thêm hợp đồng
router.post(
  "/:customerId",
  upload.single("pdfFile"),
  ContractController.createContract
);

// Sửa hợp đồng
router.put(
  "/:contractId",
  upload.single("pdfFile"),
  ContractController.updateContract
);

// Xóa hợp đồng
router.delete("/:contractId", ContractController.deleteContract);

// Xem danh sách hợp đồng
router.get("/", ContractController.getAllContracts);

// Xem danh sách hợp đồng theo UserId
router.get("/u/:customerId", ContractController.getContractsByUserId);
// Xem chi tiết hợp đồng theo ID
router.get("/:contractId", ContractController.getContractDetails);

module.exports = router;
