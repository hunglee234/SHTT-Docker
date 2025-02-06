const express = require("express");
const router = express.Router();
const ContractController = require("../../controllers/contract/contractController");

// Xem danh sách hợp đồng theo UserId
router.get("/", ContractController.getAllContractsByUserId);

// Xem chi tiết hợp đồng theo ID
router.get("/:contractId", ContractController.getContractDetails);

module.exports = router;
