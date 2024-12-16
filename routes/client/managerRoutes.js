const express = require("express");
const { authenticateToken, authorizeRole } = require("../../middleware/auth");
const router = express.Router();
const {
  createStaff,
  listStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
} = require("../../controllers/admin/managerController");

// Routes Manager
// Routes liên quan đến tài khoản nhân viên (Manager có thể tạo 2 tài khoản nhân viên)
router.post(
  "/staff",
  authenticateToken,
  authorizeRole(["manager"]),
  createStaff
);

router.get("/staff", authenticateToken, authorizeRole(["manager"]), listStaff);

router.get(
  "/staff/:id",
  authenticateToken,
  authorizeRole(["manager"]),
  getStaffById
);

router.put(
  "/staff/:id",
  authenticateToken,
  authorizeRole(["manager"]),
  updateStaff
);

router.delete(
  "/staff/:id",
  authenticateToken,
  authorizeRole(["manager"]),
  deleteStaff
);

module.exports = router;
