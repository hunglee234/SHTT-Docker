const express = require("express");
const { authenticateToken, authorizeRole } = require("../../middleware/auth");
const router = express.Router();
const {
  createStaff,
  getFullStaffList,
  getStaffById,
  updateStaffInfo,
  deleteStaff,
} = require("../../controllers/admin/managerController");

const {
  createUserInfo,
  getUserInfo,
  updateUserInfo,
  deleteUserInfo,
  getAllUsersInfo,
} = require("../../controllers/user/user");

// Tạo mới User + InfoUser
router.post("/user", createUserInfo);

// Lấy danh sách đầy đủ (Custom route)
router.get("/staffs", getFullStaffList);

// Lấy danh sách User
router.get("/users", getAllUsersInfo);

// Tạo mới tài khoản nhân viên, cộng tác viên (CTV)
router.post("/staff", createStaff);

// Lấy thông tin chi tiết nhân viên
router.get("/staff/:id", getStaffById);

// Cập nhật linh hoạt User + InfoUser + Nhân viên
router.put("/staff/:id", updateStaffInfo);

// Xóa tài khoản nhân viên
router.delete("/staff/:accountId", deleteStaff);

// Lấy thông tin đầy đủ User + InfoUser
router.get("/:userId", getUserInfo);

// Cập nhật linh hoạt User + InfoUser
router.put("/:userId", updateUserInfo);

// Xóa cả User + InfoUser
router.delete("/:userId", deleteUserInfo);

module.exports = router;
