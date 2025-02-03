const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    id: {
      type: mongoose.Schema.Types.ObjectId, // ID mặc định của MongoDB
      default: () => new mongoose.Types.ObjectId(),
    },
    resetCode: { type: String },
    resetCodeExpire: { type: Date },
    fullName: { type: String, default: "" },
    email: {
      type: String,
      required: false,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    username: { type: String, default: "", unique: true },
    role: {
      type: mongoose.Schema.Types.ObjectId, // Tham chiếu tới _id trong Role - khóa ngoại (foreign key)  - sử dụng Mongoose Population để lấy chi tiết Role khi truy vấn User.
      ref: "Role",
      required: true,
    },
    createdDate: {
      type: Date,
      default: Date.now,
    },
    updatedDate: {
      type: Date,
      default: Date.now,
    },
    token: {
      type: String,
      default: "",
    },
    provider: {
      type: String,
      required: false,
      enum: ["local", "facebook", "google", null],
      default: null,
    },
    typeaccount: {
      type: String,
      required: true,
      enum: ["individual", "company"],
      default: "individual",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Account", accountSchema);
