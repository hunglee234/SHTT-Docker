const express = require("express");
const router = express.Router();
const upload = require("../../../utils/multer");

const {
  createCategory,
  getAllCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../../../controllers/service/categoryController");

router.post("/", upload.single("image"), createCategory);

router.get("/", getAllCategory);

router.get("/:id", getCategoryById);

// router.put("/staff/:id", updateStaffInfo);
router.put("/:id", upload.single("image"), updateCategory);

// Xóa cả User + InfoUser
router.delete("/:id", deleteCategory);

module.exports = router;
