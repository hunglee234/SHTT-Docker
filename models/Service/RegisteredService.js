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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("registeredService", registeredServiceSchema);
