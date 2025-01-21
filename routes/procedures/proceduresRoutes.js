const express = require("express");
const router = express.Router();
const ProcedureController = require("../../controllers/procedure/procedureController");
// Thêm thủ tục
router.post("/", ProcedureController.createProcedure);

// Sửa thủ tục
router.put("/:procedureId", ProcedureController.updateProcedure);

// Xóa thủ tục
router.delete("/:procedureId", ProcedureController.deleteProcedure);

// Xem danh sách thủ tục
router.get("/", ProcedureController.getAllProcedures);

// Xem chi tiết thủ tục theo ID
router.get("/:procedureId", ProcedureController.getProcedureDetails);

module.exports = router;
