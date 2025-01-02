const mongoose = require("mongoose");

// Định nghĩa schema cho trường `fields` bên trong `info`
const fieldSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  fieldType: { type: String, required: true }, // text, number, date, image, etc.
});

// Định nghĩa schema cho phần `info` bên trong `Profile`
const infoSchema = new mongoose.Schema({
  type: { type: String, required: true }, // Ví dụ: Người nộp đơn, Tác giả
  fields: { type: [fieldSchema], required: true },
});

// Cập nhật schema chính của `Profile`
const profileSchema = new mongoose.Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  },
  registeredService: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "registeredService",
    required: true,
  },
  info: { type: [infoSchema], required: true }, // Tham chiếu tới danh sách info
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  image: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Image",
    default: null,
  },
  record: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Record",
    default: [],
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service", // Tham chiếu tới Service
    required: true,
  },
});

module.exports = mongoose.model("Profile", profileSchema);
