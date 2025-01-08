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
    documents: [
      {
        name: {
          type: String,
          required: false,
        },
        url: {
          type: String,
          required: false,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Process", ProcessSchema);
