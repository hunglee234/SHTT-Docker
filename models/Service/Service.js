const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  serviceName: {
    type: String,
    required: true,
  },
  shortServiceName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  price: {
    type: Number,
    required: false,
  },
  status: {
    type: String,
    enum: ["Nộp đơn", "Hợp lệ", "Cấp bằng"],
    default: "Nộp đơn",
  },
  subServices: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubService",
    },
  ],
  applicationNumber: {
    type: String,
    required: true,
    unique: true,
  },
  submissionDate: {
    type: Date,
    default: Date.now,
  },
  // Phân loại hồ sơ
  category: {
    type: String,
    enum: ["Nhãn hiệu", "Sáng chế", "Bản quyền", "Kiểu dáng công nghiệp"], // Các loại hồ sơ hợp lệ
    required: true,
  },
  // Số bằng (có thể null ban đầu)
  patentNumber: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model("Service", serviceSchema);
