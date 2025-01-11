const mongoose = require("mongoose");

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
    formNumber: {
      type: Number,
      required: false,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);
serviceSchema.index({ serviceName: "text" });
module.exports = mongoose.model("Service", serviceSchema);
