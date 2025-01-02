const mongoose = require("mongoose");
const ManagerAccount = require("../../models/Account/InfoManager");

const serviceSchema = new mongoose.Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  },
  serviceName: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CategoryService",
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // Ngày chỉnh sửa
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId, // Chuyển đổi thành ObjectId tham chiếu tới "Account"
    ref: "Account", // Chỉ định "Account" là bảng tham chiếu
    required: false,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId, // Cũng sử dụng ObjectId cho updatedBy
    ref: "Account",
    required: false,
    default: null,
  },

  // Hướng dẫn hoặc ghi chú
  notes: {
    type: String,
    required: false,
  },

  // Hình ảnh
  image: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Image",
    default: null,
  },
});

module.exports = mongoose.model("Service", serviceSchema);
