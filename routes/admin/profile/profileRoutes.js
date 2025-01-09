const express = require("express");
const router = express.Router();
const processController = require("../../../controllers/process/processController");

// Route CRUD cho tiến trình
router.post("/:profileId/processes", processController.createProcess);
router.get("/:profileId/processes", processController.getProcesses);
router.put("/:processId", processController.updateProcess);
router.delete(
  "/:profileId/processes/:processId",
  processController.deleteProcess
);

module.exports = router;
