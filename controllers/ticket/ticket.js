const Ticket = require("../../models/Ticket/Ticket");
const CategoryTicket = require("../../models/Ticket/CategoryTicket");

// Tạo ticket mới
exports.createTicket = async (req, res) => {
  try {
    const { category, name, phoneNumber, email, message } = req.body;

    const userId = req.user.id;
    // Đầu vào của category là id
    const categoryData = await CategoryTicket.findById(category);
    if (!categoryData) {
      return res
        .status(404)
        .json({ error: `Category with id '${category}' not found.` });
    }
    // Kiểm tra thông tin đầu vào
    if (!name || !phoneNumber || !email || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const createdBy = userId;
    // Tạo ticket
    const ticket = await Ticket.create({
      category,
      name,
      phoneNumber,
      email,
      message,
      createdBy,
    });
    res.status(201).json({ message: "Ticket created successfully!", ticket });
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({ error: "Failed to create ticket." });
  }
};

// Xem tất cả ticket
exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find();
    res.status(200).json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ error: "Failed to fetch tickets." });
  }
};

// Xem chi tiết ticket
exports.getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found." });
    }

    res.status(200).json(ticket);
  } catch (error) {
    console.error("Error fetching ticket:", error);
    res.status(500).json({ error: "Failed to fetch ticket." });
  }
};

// Cập nhật trạng thái ticket
exports.updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Kiểm tra trạng thái hợp lệ
    if (!["pending", "in-progress", "resolved"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value." });
    }

    // Cập nhật ticket
    const ticket = await Ticket.findByIdAndUpdate(
      id,
      { status },
      { new: true } // Trả về document sau khi cập nhật
    );

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found." });
    }

    res
      .status(200)
      .json({ message: "Ticket status updated successfully!", ticket });
  } catch (error) {
    console.error("Error updating ticket:", error);
    res.status(500).json({ error: "Failed to update ticket." });
  }
};

// Xóa ticket
exports.deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findByIdAndDelete(id);

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found." });
    }

    res.status(200).json({ message: "Ticket deleted successfully!" });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    res.status(500).json({ error: "Failed to delete ticket." });
  }
};
