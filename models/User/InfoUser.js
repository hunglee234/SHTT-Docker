const mongoose = require("mongoose");

const infoUserSchema = new mongoose.Schema({
  // Thông tin chung
  avatar: { type: String, default: "" }, // Đường dẫn URL đến ảnh đại diện
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ["Nam", "Nữ", "Khác"], default: "Khác" },
  phone: { type: String, default: "" },

  // Địa chỉ
  address: {
    province: { type: String, default: "" }, // Tỉnh
    city: { type: String, default: "" }, // Thành phố
    district: { type: String, default: "" }, // Quận/Huyện
    detail: { type: String, default: "" },
  },

  // Thông tin tài khoản
  employeeId: { type: String, default: "" }, // Mã số nhân viên
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
    required: true,
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
  user: {
    type: mongoose.Schema.Types.ObjectId, // Tham chiếu tới _id trong User - khóa ngoại (foreign key)  - sử dụng Mongoose Population để lấy chi tiết Role khi truy vấn User.
    ref: "User",
    required: true,
  },
  regisService: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RegisteredService",
    required: false,
    default: null,
  },
});

module.exports = mongoose.model("InfoUser", infoUserSchema);
