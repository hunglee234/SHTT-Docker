const mongoose = require("mongoose");

const avatarSchema = new mongoose.Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  },
  url: {
    type: String,
    required: true, // Đường dẫn hoặc URL của ảnh
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Avatar", avatarSchema);
