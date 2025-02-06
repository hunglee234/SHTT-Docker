const mongoose = require("mongoose");

const ContractsSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
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
ContractsSchema.index({ name: "text" });
module.exports = mongoose.model("Contract", ContractsSchema);
