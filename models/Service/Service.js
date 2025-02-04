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
    serviceCode: { type: String, unique: true, default: "" },
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
      required: true,
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
serviceSchema.index({ serviceName: "text" });
// Middleware để tự động cập nhật formName từ serviceName
// serviceSchema.pre("save", function (next) {
//   if (this.serviceName) {
//     // Chuyển serviceName thành dạng slug và gán vào formName
//     this.formName = removeVietnameseTones(this.serviceName)
//       .toLowerCase() // Chuyển thành chữ thường
//       .replace(/[\s\-]+/g, "-") // Thay khoảng trắng hoặc dấu '-' bằng '-'
//       .replace(/[^\w\-]+/g, "") // Loại bỏ ký tự không hợp lệ
//       .replace(/^-+|-+$/g, ""); // Loại bỏ dấu '-' ở đầu hoặc cuối
//   }
//   next();
// });
module.exports = mongoose.model("Service", serviceSchema);
