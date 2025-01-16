const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = require("../../../utils/multer");

const {
  createCustomer,
  getStaffCustomerId,
  updateCustomer,
  deleteCustomer,
} = require("../../../controllers/admin/customerController");

// Tạo mới tài khoản nhân viên, cộng tác viên (CTV)
router.post("/", upload.single("avatar"), createCustomer);

// Lấy thông tin chi tiết nhân viên
router.get("/:id", getStaffCustomerId);

// Cập nhật thông tin Nhân viên
router.put("/:id", upload.single("avatar"), updateCustomer);

// Xóa tài khoản nhân viên
router.delete("/:id", deleteCustomer);

module.exports = router;
