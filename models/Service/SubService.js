const { timeStamp } = require("console");
const mongoose = require("mongoose");

const subServiceSchema = new mongoose.Schema({
  subServiceName: {
    type: String, // Tên của sub-service (VD: Đăng ký nhãn hiệu, Bảo hộ nhãn hiệu,...)
    required: true,
  },
  details: {
    applicantInfo: {
      name: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    },
    serviceInfo: {
      inventionName: {
        type: String,
        required: true,
      },
      technicalField: {
        type: String,
        required: true,
      },
      summary: {
        type: String,
        required: true,
      },
    },
    attachments: {
      authorizationFile: {
        type: String,
        required: true,
      },
      logoFile: {
        type: String, // Lưu đường dẫn ảnh cho logo nhãn hiệu
        required: true,
      },
    },
  },
});

module.exports = mongoose.model("SubService", subServiceSchema);
