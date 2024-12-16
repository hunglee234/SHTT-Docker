const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: mongoose.Schema.Types.ObjectId, // Tham chiếu tới _id trong Role - khóa ngoại (foreign key)  - sử dụng Mongoose Population để lấy chi tiết Role khi truy vấn User.
    ref: "Role", // Đối chiếu với model "Role"
    required: true,
  },
});

module.exports = mongoose.model("User", userSchema);
