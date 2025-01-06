const express = require("express");
const router = express.Router();
const staffRoutes = require("../../routes/manager/staff/staffRoutes");

router.use("/staff", staffRoutes);
// const {
//   createUserInfo,
//   getUserInfo,
//   updateUserInfo,
//   deleteUserInfo,
//   getAllUsersInfo,
// } = require("../../controllers/user/user");

// Tạo mới User + InfoUser
// router.post("/user", createUserInfo);

// Lấy danh sách User
// router.get("/users", getAllUsersInfo);

// Lấy thông tin đầy đủ User + InfoUser
// router.get("/:userId", getUserInfo);

// Cập nhật linh hoạt User + InfoUser
// router.put("/:userId", updateUserInfo);

// Xóa cả User + InfoUser
// router.delete("/:userId", deleteUserInfo);

module.exports = router;
