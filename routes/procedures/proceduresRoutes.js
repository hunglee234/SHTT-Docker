const express = require("express");
const router = express.Router();
const ProcedureController = require("../../controllers/procedure/procedureController");
const upload = require("../../utils/multer");
// Thêm thủ tục
router.post(
  "/",
  upload.fields([
    { name: "txtFile", maxCount: 1 },
    { name: "File", maxCount: 1 },
  ]),
  ProcedureController.createProcedure
);

// Sửa thủ tục
router.put(
  "/:procedureId",
  upload.fields([
    { name: "txtFile", maxCount: 1 },
    { name: "File", maxCount: 1 },
  ]),
  ProcedureController.updateProcedure
);

// Xóa thủ tục
router.delete("/:procedureId", ProcedureController.deleteProcedure);

// Xem danh sách thủ tục
router.get("/", ProcedureController.getAllProcedures);

// Xem danh sách thủ tục dựa theo categoryID
router.get("/c/:categoryId", ProcedureController.getProceduresByCategory);

// Xem chi tiết thủ tục theo ID
router.get("/:procedureId", ProcedureController.getProcedureDetails);

module.exports = router;
