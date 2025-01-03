const mongoose = require("mongoose");

const TicketSchema = new mongoose.Schema({
  // Tên loại ticket
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CategoryTicket",
    required: true,
  },
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

// Tạo text index cho trường message
TicketSchema.index({ message: "text" });
module.exports = mongoose.model("Ticket", TicketSchema);
