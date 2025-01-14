const express = require("express");
const router = express.Router();
const processController = require("../../../controllers/process/processController");
const upload = require("../../../utils/multer");
// Route CRUD cho tiến trình
router.post(
  "/:profileId/processes",
  upload.single("pdfFile"),
  processController.createProcess
);
router.get("/:profileId/processes", processController.getProcesses);
router.put("/:processId", processController.updateProcess);
router.delete(
  "/:profileId/processes/:processId",
  processController.deleteProcess
);

// Router Hồ sơ

module.exports = router;
