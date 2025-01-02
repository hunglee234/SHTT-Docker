const mongoose = require("mongoose");

const changeSchema = new mongoose.Schema({
  type: { type: String, required: true },
  fieldName: { type: String, required: true },
  oldValue: { type: String, required: true },
  newValue: { type: String, required: true },
});

// Lịch sử chỉnh sửa hồ sơ
const recordSchema = new mongoose.Schema({
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
    required: true,
  },
  // Người chỉnh sửa
  // Khi sửa thì sẽ tự động lưu lại được updated bởi ai, ngày nào
  // Có thể là admin, manager, nhân viên
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    default: null,
  },
  // Khi sửa thì sẽ tự động lưu lại được updated bởi ngày nào
  // Ngày chỉnh sửa
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  // Trạng thái hồ sơ
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "under review"],
    required: true,
  },

  // Loại hồ sơ
  recordType: {
    type: String,
    enum: ["Đơn đăng ký", "Đơn yêu cầu", null],
    default: null,
  },

  changes: [changeSchema],
});

module.exports = mongoose.model("Record", recordSchema);
