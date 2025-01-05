const mongoose = require("mongoose");

const infoStaffSchema = new mongoose.Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId, // ID mặc định của MongoDB
    default: () => new mongoose.Types.ObjectId(),
  },
  avatar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Image", // Tạo 1 collection avatar-img
    default: null,
  },
  staffCode: { type: String, unique: true, default: "" },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ["Nam", "Nữ", "Khác"], default: "Khác" },
  phone: { type: String, default: "" },
  // Địa chỉ
  address: {
    province: { type: String, default: "" },
    city: { type: String, default: "" },
    district: { type: String, default: "" },
    detail: { type: String, default: "" },
  },
  joinDate: { type: Date },
  status: {
    type: String,
    enum: ["Nhân viên chính thức", "Thực tập sinh", "Nhân viên thử việc"],
    default: "Nhân viên thử việc",
  }, // Trạng thái
  position: {
    type: String,
    enum: ["Cộng tác viên", "Nhân viên"],
    default: "Cộng tác viên",
    required: true,
  },
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },
  createdByManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },
  branch: { type: String, default: "" },
});

module.exports = mongoose.model("InfoStaff", infoStaffSchema);
