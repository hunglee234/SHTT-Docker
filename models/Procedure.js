const mongoose = require("mongoose");

const ProcedureSchema = new mongoose.Schema(
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

module.exports = mongoose.model("Procedure", ProcedureSchema);
