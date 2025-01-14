const mongoose = require("mongoose");

// Định nghĩa schema cho trường `fields` bên trong `info`
const fieldSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  fieldType: { type: String, required: true },
});

// Định nghĩa schema cho phần `info` bên trong `Profile`
const infoSchema = new mongoose.Schema({
  type: { type: String, required: true },
  fields: { type: [fieldSchema], required: true },
});

// Cập nhật schema chính của `Profile`
const profileSchema = new mongoose.Schema(
  {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
    },
    profileCode: { type: String, unique: true, default: "" },
    registeredService: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "registeredService",
      required: true,
    },
    info: { type: [infoSchema], required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      default: null,
    },
    managerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      default: null,
      required: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    processes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Process",
      },
    ],
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
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "under review"],
      default: "pending",
    },
    image: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Profile", profileSchema);
