const mongoose = require("mongoose");

const DocumentsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
    },
    pdfUrl: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);
DocumentsSchema.index({ name: "text" });
module.exports = mongoose.model("Document", DocumentsSchema);
