const express = require("express");
const router = express.Router();

const {
  createCategory,
  isAdmin,
  getAllCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../../../controllers/service/categoryController");

router.post("/", createCategory);

router.get("/", getAllCategory);

router.get("/:id", getCategoryById);

// router.put("/staff/:id", updateStaffInfo);
router.put("/:id", updateCategory);

// Xóa cả User + InfoUser
router.delete("/:id", deleteCategory);

module.exports = router;
