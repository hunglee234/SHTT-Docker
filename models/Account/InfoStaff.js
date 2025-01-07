const mongoose = require("mongoose");

const infoStaffSchema = new mongoose.Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId, // ID mặc định của MongoDB
    default: () => new mongoose.Types.ObjectId(),
  },
  avatar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Avatar",
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
    enum: ["Hoạt động", "Không hoạt động"],
    default: "Hoạt động",
  }, // Trạng thái
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
});

module.exports = mongoose.model("InfoStaff", infoStaffSchema);
