const Ticket = require("../../models/Ticket/Ticket");
const CategoryTicket = require("../../models/Ticket/CategoryTicket");
const InfoAccount = require("../../models/Account/InfoStaff");
const moment = require("moment");
// Tạo ticket mới
exports.createTicket = async (req, res) => {
  try {
    const { name, phoneNumber, email, message } = req.body;
    const { profileID } = req.params;
    const userId = req.user.id;

    // Kiểm tra thông tin đầu vào
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const createdBy = userId;
    const ticketData = { message, createdBy };

    // Nếu có profileID, chỉ cần message
    if (profileID) {
      ticketData.profileID = profileID;
    } else {
      if (!name || !phoneNumber || !email) {
        return res.status(400).json({
          error:
            "Name, phoneNumber, and email are required when profileID is not provided.",
        });
      }
      ticketData.name = name;
      ticketData.phoneNumber = phoneNumber;
      ticketData.email = email;
    }

    const ticket = await Ticket.create(ticketData);
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

    // Lấy danh sách nhân viên do userId quản lý (dựa vào trường `account`)
    const managedStaff = await InfoAccount.find({
      createdByManager: user.id,
    }).select("account");

    // Chuyển danh sách `account` thành mảng ID
    const managedStaffIds = managedStaff.map((staff) =>
      staff.account.toString()
    );

    // Điều kiện xác định quyền truy cập của người dùng
    if (user.role === "SuperAdmin" || user.role === "Admin") {
    } else {
      ticketsQuery.createdBy = { $in: [user.id, ...managedStaffIds] };
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
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

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
      user.role === "SuperAdmin" ||
      user.role === "Manager" ||
      user.role === "Staff" ||
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
    const skip = (page - 1) * limit;
    // Lấy danh sách nhân viên do userId quản lý (dựa vào trường `account`)
    const managedStaff = await InfoAccount.find({
      createdByManager: userId,
    }).select("account");

    // Chuyển danh sách `account` thành mảng ID
    const managedStaffIds = managedStaff.map((staff) =>
      staff.account.toString()
    );

    // Xây dựng truy vấn: lấy ticket của userId và nhân viên họ quản lý
    let ticketQuery = { createdBy: { $in: [userId, ...managedStaffIds] } };

    const ticketCustomer = await Ticket.find(ticketQuery)
      .sort({ createdAt: -1 })
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

    if (user.role !== "Admin" && user.role !== "SuperAdmin") {
      return res.status(403).json({
        error: "Bạn không có quyền cập nhật trạng thái",
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

    if (user.role !== "SuperAdmin" && user.role !== "Admin") {
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
