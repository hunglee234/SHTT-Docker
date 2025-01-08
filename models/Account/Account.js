const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId, // ID mặc định của MongoDB
    default: () => new mongoose.Types.ObjectId(),
  },
  fullName: { type: String, default: "" },
  email: {
    type: String,
    required: true,
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
});

module.exports = mongoose.model("Account", accountSchema);
