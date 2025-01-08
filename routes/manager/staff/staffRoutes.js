const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = require("../../../utils/multer");

const {
  createStaff,
  getFullStaffList,
  getStaffById,
  updateStaff,
  deleteStaff,
} = require("../../../controllers/admin/managerController");

// Tạo mới tài khoản nhân viên, cộng tác viên (CTV)
router.post("/", upload.single("avatar"), createStaff);

router.get("/", getFullStaffList);

// Lấy thông tin chi tiết nhân viên
router.get("/:id", getStaffById);

// Cập nhật thông tin Nhân viên
router.put("/:id", upload.single("avatar"), updateStaff);

// Xóa tài khoản nhân viên
router.delete("/:id", deleteStaff);

module.exports = router;
