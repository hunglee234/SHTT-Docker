const mongoose = require("mongoose");

// Hàm loại bỏ dấu tiếng Việt
function removeVietnameseTones(str) {
  return str
    .normalize("NFD") // Chuyển thành dạng tổ hợp ký tự
    .replace(/[\u0300-\u036f]/g, "") // Loại bỏ các dấu
    .replace(/đ/g, "d") // Chuyển đ -> d
    .replace(/Đ/g, "D") // Chuyển Đ -> D
    .replace(/[^\w\s\-]/g, "") // Loại bỏ các ký tự đặc biệt
    .trim(); // Xóa khoảng trắng đầu/cuối
}
const serviceSchema = new mongoose.Schema(
  {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
    },
    serviceName: {
      type: String,
      required: true,
    },
    serviceCode: { type: String, unique: true },
    price: { type: String, required: true, default: "" },
    status: {
      type: String,
      enum: ["Đang hoạt động", "Không hoạt động"],
      default: "Đang hoạt động",
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
    procedure: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Procedure",
      default: null,
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
      ref: "File",
      default: null,
    },
    formName: {
      type: String,
      required: false,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);
// Tạo index thủ công với Partial Filter
serviceSchema.index(
  { serviceName: 1, serviceCode: 1, formName: 1 },
  {
    unique: true,
    partialFilterExpression: {
      serviceName: { $exists: true, $ne: null, $ne: "" },
      serviceCode: { $exists: true, $ne: null, $ne: "" },
      formName: { $exists: true, $ne: null, $ne: "" },
    },
  }
);

serviceSchema.index({ serviceName: "text" });
module.exports = mongoose.model("Service", serviceSchema);
