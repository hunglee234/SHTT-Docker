const mongoose = require("mongoose");

const registeredServiceSchema = new mongoose.Schema(
  {
    // chỗ này cần liên kết với bảng service để lấy id và truy xuất nhé
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Service",
    },
    createdUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    managerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: false,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("registeredService", registeredServiceSchema);

// Đảm bảo rằng một người dùng không đăng ký trùng lặp cùng một dịch vụ
// registeredServiceSchema.index(
//   { serviceId: 1, createdUserId: 1 },
//   { unique: true }
// );
