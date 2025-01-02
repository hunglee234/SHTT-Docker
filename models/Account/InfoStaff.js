const mongoose = require("mongoose");

const infoStaffSchema = new mongoose.Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId, // ID mặc định của MongoDB
    default: () => new mongoose.Types.ObjectId(),
  },
  avatar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Image",
    default: null,
  },

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
  joinDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["Đang làm", "Đã nghỉ việc"],
    default: "Đang làm",
  }, // Trạng thái
  position: {
    type: String,
    enum: ["Quản lý", "Cộng tác viên", "Nhân viên"],
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
    ref: "InfoManager",
    required: true,
  },
});

module.exports = mongoose.model("InfoStaff", infoStaffSchema);
