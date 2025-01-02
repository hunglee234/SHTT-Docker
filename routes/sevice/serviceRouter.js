const express = require("express");
const serviceController = require("../../controllers/service/serviceController");
const { authenticateToken } = require("../../middleware/auth");
const router = express.Router();

// Đăng ký dịch vụ (cần đăng nhập)
router.post("/register", authenticateToken, serviceController.registerService);

router.put("/update", authenticateToken, serviceController.updateProfileInfo);

// Xem lịch sử chỉnh sửa hồ sơ đăng ký dịch vụ
router.get(
  "/history/:profileId",
  authenticateToken,
  serviceController.getEditHistory
);

// Lấy danh sách dịch vụ (cần đăng nhập)
router.get("/list", authenticateToken, serviceController.getServiceList);

// Chi tiết dịch vụ (cần đăng nhập)
router.get(
  "/:serviceId",
  authenticateToken,
  serviceController.getServiceDetails
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
