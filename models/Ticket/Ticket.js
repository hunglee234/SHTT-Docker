const mongoose = require("mongoose");

const TicketSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CategoryTicket",
      required: false,
    },
    name: { type: String, required: false },
    phoneNumber: { type: String, required: false },
    email: { type: String, required: false },
    message: { type: String, required: true },
    status: { type: String, default: "pending" },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    adminResponse: { type: String, default: null },
    isAnswered: { type: Boolean, default: false },
    answeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      default: null,
    },
    profileID: { type: mongoose.Schema.Types.ObjectId, ref: "Profile" },
  },
  {
    timestamps: true,
  }
);

// Tạo text index cho trường message
TicketSchema.index({ message: "text" });
module.exports = mongoose.model("Ticket", TicketSchema);
