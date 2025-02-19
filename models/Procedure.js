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
  },
  { timestamps: true }
);
ProcedureSchema.index({ name: "text" });
module.exports = mongoose.model("Procedure", ProcedureSchema);
