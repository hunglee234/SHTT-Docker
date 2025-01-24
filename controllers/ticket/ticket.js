const Ticket = require("../../models/Ticket/Ticket");
const CategoryTicket = require("../../models/Ticket/CategoryTicket");
const moment = require("moment");
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
    const user = req.user;
    const {
      search_value,
      from_date,
      to_date,
      page = 1,
      limit = 10,
    } = req.query;

    // Khởi tạo query để tìm kiếm
    let ticketsQuery = {};

    if (
      search_value &&
      search_value.trim() !== "" &&
      search_value.trim() !== '""'
    ) {
      const cleanSearchValue = search_value.replace(/"/g, "").trim();
      ticketsQuery.message = { $regex: cleanSearchValue, $options: "i" };
    }

    // Điều kiện xác định quyền truy cập của người dùng
    if (user.role === "SuperAdmin" || user.role === "Admin") {
    } else {
      ticketsQuery.createdBy = user.id;
    }

    // Bộ lọc theo form_date và to_date (ngày tháng)
    if (from_date && to_date) {
      const startDate = moment
        .utc(from_date, "DD/MM/YYYY")
        .startOf("day")
        .toDate();
      const endDate = moment.utc(to_date, "DD/MM/YYYY").endOf("day").toDate();

      ticketsQuery.createdAt = {
        $gte: startDate,
        $lte: endDate,
      };
    }
    // console.log("Date Query:", ticketsQuery.createdAt);

    // Lấy tickets từ cơ sở dữ liệu theo query đã xây dựng
    const skip = (page - 1) * limit;
    const tickets = await Ticket.find(ticketsQuery)
      .skip(skip)
      .limit(parseInt(limit));

    const totalTickets = await Ticket.countDocuments(ticketsQuery);
    const totalPages = Math.ceil(totalTickets / limit);

    // Trả về kết quả
    res.status(200).json({
      message: "Danh sách ticket",
      data: {
        currentPage: page,
        totalPages: totalPages,
        totalTickets: totalTickets,
        tickets: tickets,
      },
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ error: "Failed to fetch tickets." });
  }
};

// Xem chi tiết ticket
exports.getTicketById = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const ticket = await Ticket.findById(id).populate({
      path: "createdBy answeredBy",
      select: "fullName",
    });
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found." });
    }
    if (
      user.role === "Admin" ||
      user.role === "Manager" ||
      user.role === "Employee" ||
      user.role === "Collaborator" ||
      ticket.createdBy.toString() === user.id
    ) {
      return res.status(200).json(ticket);
    }
    return res.status(403).json({ error: "Access denied." });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    res.status(500).json({ error: "Failed to fetch ticket." });
  }
};

// Xem danh sách Ticket by UserId
exports.getTicketByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    let ticketQuery = {
      createdBy: userId,
    };

    const skip = (page - 1) * limit;
    const ticketCustomer = await Ticket.find(ticketQuery)
      .skip(skip)
      .limit(parseInt(limit))
      .populate({
        path: "createdBy answeredBy",
        select: "fullName",
      });

    if (!ticketCustomer) {
      return res.status(404).json({
        message: "Không tìm thấy vé cho người dùng này.",
      });
    }

    const totalTickets = await Ticket.countDocuments(ticketQuery);
    const totalPages = Math.ceil(totalTickets / limit);

    return res.status(200).json({
      message: "Ticket By UserId :",
      data: {
        currentPage: page,
        totalPages: totalPages,
        totalTickets: totalTickets,
        ticketCustomer: ticketCustomer,
      },
    });
  } catch (error) {
    console.error(error);
    // Xử lý lỗi nếu có
    return res.status(500).json({
      message: "Có lỗi xảy ra, vui lòng thử lại sau!",
    });
  }
};

// Cập nhật trạng thái ticket
exports.updateTicketStatus = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { status } = req.body;

    if (user.role !== "Admin") {
      return res.status(403).json({
        error: "Access denied. Only Admin can update the ticket status.",
      });
    }

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
    const user = req.user; // Lấy từ middleware xác thực
    const { id } = req.params;

    if (user.role !== "Admin") {
      return res
        .status(403)
        .json({ error: "Access denied. Only Admin can delete the ticket." });
    }
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

// Trả lời ticket
exports.replyTicket = async (req, res) => {
  const { ticketId } = req.params;
  const { adminResponse } = req.body;
  const { id: adminId } = req.user;

  try {
    // Tìm và cập nhật ticket
    const updatedTicket = await Ticket.findByIdAndUpdate(
      ticketId,
      {
        adminResponse,
        isAnswered: true,
        answeredBy: adminId,
      },
      { new: true } // Đảm bảo trả về dữ liệu sau khi cập nhật
    )
      .populate("answeredBy", "fullName email") // Populate thông tin người trả lời
      .exec();
    // Kiểm tra nếu ticket không tồn tại
    if (!updatedTicket) {
      return res.status(404).json({ message: "Ticket không tồn tại!" });
    }

    return res.status(200).json({
      message: "Phản hồi ticket thành công!",
      data: updatedTicket,
    });
  } catch (error) {
    console.error("Lỗi khi trả lời ticket:", error);
    return res
      .status(500)
      .json({ message: "Có lỗi xảy ra, vui lòng thử lại sau!" });
  }
};
