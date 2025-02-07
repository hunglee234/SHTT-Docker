const mongoose = require("mongoose");

// Định nghĩa schema cho trường `fields` bên trong `info`
const fieldSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  fieldType: {
    type: String,
    required: true,
    enum: ["text", "pdf", "image", "email", "select"],
  },
});

// Định nghĩa schema cho phần `info` bên trong `Profile`
const infoSchema = new mongoose.Schema({
  type: { type: String, required: true },
  fields: { type: [fieldSchema], required: true },
});

const OwnerLetterSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  address: { type: String, required: true },
});

// Cập nhật schema chính của `Profile`
const profileSchema = new mongoose.Schema(
  {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
    },
    profileCode: { type: String, unique: true, default: "" },
    numberOfCertificates: {
      type: String,
      unique: true,
      default: "",
    },
    dateActive: {
      type: Date,
      default: Date.now,
    },
    brand: {
      type: String,
      default: "",
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      default: Date.now,
    },
    info: { type: [infoSchema], required: true },
    registeredService: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "registeredService",
      required: true,
    },
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
    createdDate: {
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
      enum: ["Chờ duyệt", "Đang triển khai", "Đã hoàn thành", "Tạm ngưng"],
      default: "Chờ duyệt",
    },
    image: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
      default: null,
    },
    represent: {
      type: OwnerLetterSchema,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Profile", profileSchema);
