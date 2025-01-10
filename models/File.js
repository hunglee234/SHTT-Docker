const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    enum: ["image", "pdf"],
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("File", fileSchema);
