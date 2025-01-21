const express = require("express");
const serviceController = require("../../controllers/service/serviceController");
const { authenticateToken } = require("../../middleware/auth");
const router = express.Router();
const upload = require("../../utils/multer");

router.post(
  "/submit/:formName",
  authenticateToken,
  upload.fields([
    { name: "gallery", maxCount: 3 },
    { name: "image", maxCount: 1 },
  ]),
  serviceController.registerService
);

router.put(
  "/update/:profileId",
  authenticateToken,
  upload.fields([
    { name: "gallery", maxCount: 3 },
    { name: "image", maxCount: 1 },
  ]),
  serviceController.updateDetailsProfile
);

// Lấy danh sách dịch vụ (cần đăng nhập)
// Chức năng xem full Danh sách Hồ sơ đăng ký
router.get("/list", authenticateToken, serviceController.getProfileList);

// Chi tiết Hồ sơ (cần đăng nhập)
router.get(
  "/:profileId",
  authenticateToken,
  serviceController.getProfileDetails
);

// Quyền này dành cho nhân viên và manager
// chỉ xóa phần đăng ký dịch vụ của khách
// // Xóa dịch vụ (cần đăng nhập)
router.delete(
  "/list/:profileId",
  authenticateToken,
  serviceController.deleteProfile
);

module.exports = router;
