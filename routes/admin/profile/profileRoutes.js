const express = require("express");
const router = express.Router();
const processController = require("../../../controllers/process/processController");
const serviceController = require("../../../controllers/service/serviceController");
const upload = require("../../../utils/multer");
// Route CRUD cho tiến trình
router.post(
  "/:profileId/processes",
  upload.single("pdfFile"),
  processController.createProcess
);
router.get("/:profileId/processes", processController.getProcesses);
router.put(
  "/:processId",
  upload.single("pdfFile"),
  processController.updateProcess
);
router.delete(
  "/:profileId/processes/:processId",
  processController.deleteProcess
);

// Router Hồ sơ
// Get danh sách hồ sơ và chi tiết hồ sơ
// Tạo hồ sơ cho khách luôn

router.post(
  "/:userId/:formName",
  upload.fields([
    { name: "gallery", maxCount: 3 },
    { name: "image", maxCount: 1 },
  ]),
  serviceController.registerServicebyAdmin
);

router.put(
  "/u/:profileId/general",
  upload.none(),
  serviceController.updateGeneralProfileByAdmin
);

router.put(
  "/u/:profileId/details",
  upload.fields([
    { name: "gallery", maxCount: 3 },
    { name: "image", maxCount: 1 },
  ]),
  serviceController.updateDetailsProfile
);

router.get("/list", serviceController.getProfileList);

// Chi tiết Hồ sơ (cần đăng nhập)
router.get("/:profileId", serviceController.getProfileDetails);

router.delete("/l/:profileId", serviceController.deleteProfile);

module.exports = router;
