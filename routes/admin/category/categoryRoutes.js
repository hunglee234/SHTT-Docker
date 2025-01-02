const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  authorizeRole,
} = require("../../../middleware/auth");

const {
  createCategory,
  isAdmin,
  getAllCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../../../controllers/service/categoryController");

router.post("/", authenticateToken, authorizeRole(["Admin"]), createCategory);

router.get("/", authenticateToken, authorizeRole(["Admin"]), getAllCategory);

router.get(
  "/:id",
  authenticateToken,
  authorizeRole(["Admin"]),
  getCategoryById
);

// router.put("/staff/:id", updateStaffInfo);
router.put("/:id", authenticateToken, authorizeRole(["Admin"]), updateCategory);

// Xóa cả User + InfoUser
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole(["Admin"]),
  deleteCategory
);

module.exports = router;
