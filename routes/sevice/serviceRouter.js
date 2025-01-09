const express = require("express");
const serviceController = require("../../controllers/service/serviceController");
const { authenticateToken } = require("../../middleware/auth");
const router = express.Router();
const upload = require("../../utils/multer");

// Đăng ký dịch vụ (cần đăng nhập)
router.post(
  "/register/:serviceId",
  authenticateToken,
  upload.fields([{ name: "gallery", maxCount: 3 }]),
  serviceController.registerService
);

// router.put("/update", authenticateToken, serviceController.updateProfileInfo);

// Xem lịch sử chỉnh sửa hồ sơ đăng ký dịch vụ
router.get(
  "/history/:profileId",
  authenticateToken,
  serviceController.getEditHistory
);

// Lấy danh sách dịch vụ (cần đăng nhập)
// Chức năng xem full Danh sách Hồ sơ đăng ký
router.get("/list", authenticateToken, serviceController.getServiceList);

// Chi tiết Hồ sơ (cần đăng nhập)
router.get(
  "/:profileId",
  authenticateToken,
  serviceController.getProfileDetails
);

// Quyền này dành cho nhân viên và manager
// chỉ xóa phần đăng ký dịch vụ của khách
// // Xóa dịch vụ (cần đăng nhập)
// router.delete(
//   "/:serviceId",
//   authenticateToken,
//   serviceController.deleteService
// );

module.exports = router;
