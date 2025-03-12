const mongoose = require("mongoose");

const categoryServiceSchema = new mongoose.Schema(
  {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
    },
    categoryName: {
      type: String,
      required: true,
      unique: true,
    },
    // Hình ảnh
    image: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
      default: null,
    },
    // Mô tả thể loại dịch vụ
    description: {
      type: String,
      default: "",
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
  },
  {
    timestamps: true,
  }
);
categoryServiceSchema.index({ categoryName: "text" });
module.exports = mongoose.model("CategoryService", categoryServiceSchema);
