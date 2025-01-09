const mongoose = require("mongoose");

const categoryServiceSchema = new mongoose.Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  },
  categoryName: {
    type: String,
    required: true,
    unique: true,
  },

  // Mô tả thể loại dịch vụ
  description: {
    type: String,
    default: "",
  },

  // Ngày tạo
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
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: false,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: false,
    default: null,
  },

  // Hình ảnh
  image: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Image",
    default: null,
  },
});
categoryServiceSchema.index({ categoryName: "text" });
module.exports = mongoose.model("CategoryService", categoryServiceSchema);
