const mongoose = require("mongoose");

const ProcedureSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
    },
    txtUrl: {
      type: String,
      required: false,
    },
    fileUrl: {
      type: String,
      required: false,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CategoryService",
      required: false,
    },
    submissionTime: {
      type: String, // Thời gian nộp hồ sơ
      required: false,
    },
    reviewTime: {
      type: String, // Thời gian thẩm định
      required: false,
    },
  },
  { timestamps: true }
);
ProcedureSchema.index({ name: "text" });
module.exports = mongoose.model("Procedure", ProcedureSchema);
