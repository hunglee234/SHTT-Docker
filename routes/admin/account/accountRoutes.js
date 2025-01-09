const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = require("../../../utils/multer");

const {
  createAccount,
  getFullAccountList,
  getAccountById,
  updateAccount,
  deleteAccount,
} = require("../../../controllers/admin/adminController");

// Tạo tài khoản admin
router.post("/", upload.single("avatar"), createAccount);

router.get("/", getFullAccountList);

router.get("/:id", getAccountById);

router.put("/:id", upload.single("avatar"), updateAccount);

router.delete("/:id", deleteAccount);

module.exports = router;
