const express = require("express");
const router = express.Router();
const { authenticateToken, authorizeRole } = require("../../middleware/auth");
const {
  createCustomer,
  getCustomers,
  updateCustomer,
  deleteCustomer,
  createAccount,
  getAccounts,
  updateAccount,
  deleteAccount,
} = require("../../controllers/admin/adminController");

const {
  createService,
  getServices,
  updateService,
  deleteService,
} = require("../../controllers/admin/serviceController");

// Routes liên quan đến khách hàng (CMS)
router.post(
  "/customer",
  authenticateToken,
  authorizeRole(["admin"]),
  createCustomer
);
router.get(
  "/customer",
  authenticateToken,
  authorizeRole(["admin"]),
  getCustomers
);
router.put(
  "/customer/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  updateCustomer
);
router.delete(
  "/customer/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  deleteCustomer
);

// Routes liên quan đến tài khoản (CMS)
router.post(
  "/account",
  authenticateToken,
  authorizeRole(["admin"]),
  createAccount
);
router.get(
  "/account",
  authenticateToken,
  authorizeRole(["admin"]),
  getAccounts
);
router.put(
  "/account/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  updateAccount
);
router.delete(
  "/account/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  deleteAccount
);

// Thêm sửa xóa dịch vụ
// Route: Thêm dịch vụ mới
router.post(
  "/service",
  authenticateToken,
  authorizeRole(["admin"]),
  createService
);

// Route: Lấy danh sách dịch vụ
router.get(
  "/service",
  authenticateToken,
  authorizeRole(["admin"]),
  getServices
);

// Route: Cập nhật dịch vụ
router.put(
  "/service/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  updateService
);

// Route: Xóa dịch vụ
router.delete(
  "/service/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  deleteService
);

module.exports = router;
