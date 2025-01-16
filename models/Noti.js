const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notiSchema = new Schema(
  {
    profileId: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["New", "Read"],
      default: "New",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Noti", notiSchema);
