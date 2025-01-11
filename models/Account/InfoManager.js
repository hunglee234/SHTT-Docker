const mongoose = require("mongoose");

const infoManagerSchema = new mongoose.Schema(
  {
    id: {
      type: mongoose.Schema.Types.ObjectId, // ID mặc định của MongoDB
      default: () => new mongoose.Types.ObjectId(),
    },
    companyName: {
      type: String,
      required: true,
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    website: {
      type: String,
      default: "",
    },
    phone: { type: String, default: "" },
    // Địa chỉ
    address: {
      province: { type: String, default: "" },
      city: { type: String, default: "" },
      district: { type: String, default: "" },
      detail: { type: String, default: "" },
    },
    avatar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Image",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("InfoManager", infoManagerSchema);
