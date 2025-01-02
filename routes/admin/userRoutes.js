// const express = require("express");
// const {
//   getAllUsers,
//   createUser,
// } = require("../../controllers/adminController");
// // const { verifyToken, isAdmin } = require("../../middleware/auth");
// const { isAdmin } = require("../../middleware/auth");
// const router = express.Router();

// // router.get("/", verifyToken, isAdmin, getAllUsers);
// // router.post("/", verifyToken, isAdmin, createUser);

// router.get("/", isAdmin, getAllUsers);
// router.post("/", isAdmin, createUser);

// module.exports = router;

const express = require("express");
const router = express.Router();
const adminController = require("../../controllers/adminController");

// Route: Lấy danh sách tất cả người dùng
router.get("/users", adminController.getAllUsers);

// Route: Tạo một người dùng mới
router.post("/users", adminController.createUser);

module.exports = router;
