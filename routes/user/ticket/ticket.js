const express = require("express");
const router = express.Router();
const TicketController = require("../../../controllers/ticket/ticket");

// Thêm Authenticate để bắt buộc phải login khi để lại ticket
router.post("/create", TicketController.createTicket);

// Xem tất cả ticket

router.get("/", TicketController.getAllTickets);

// Xem chi tiết ticket
router.get("/:id", TicketController.getTicketById);

// Cập nhật trạng thái ticket
router.put("/:id", TicketController.updateTicketStatus);

// Xóa ticket
router.delete("/:id", TicketController.deleteTicket);

// router.get("/:userId");

module.exports = router;
