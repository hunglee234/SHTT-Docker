const mongoose = require("mongoose");

const ProcessSchema = new mongoose.Schema(
  {
    processContent: {
      type: String,
      required: false,
    },
    completionDate: {
      type: Date,
      required: false,
    },
    pdfUrl: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ["Đã thực hiện", "Chờ duyệt"],
      default: "Chờ duyệt",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Process", ProcessSchema);
