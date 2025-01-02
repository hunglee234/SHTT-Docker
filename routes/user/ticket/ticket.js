const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  authorizeRole,
} = require("../../../middleware/auth");

const TicketController = require("../../../controllers/ticket/ticket");

// Thêm Authenticate để bắt buộc phải login khi để lại ticket
router.post(
  "/create",
  authenticateToken,
  authorizeRole(["User"]),
  TicketController.createTicket
);

// Xem tất cả ticket
// những ai tạo ticket chỉ xem được của mình thôi
router.get("/", TicketController.getAllTickets);

// Xem chi tiết ticket
router.get("/:id", TicketController.getTicketById);

// Cập nhật trạng thái ticket
router.put("/:id", TicketController.updateTicketStatus);

// Sửa nội dung ticket
// router.patch("/:id", TicketController.updateTicketContent);

// Xóa ticket
router.delete("/:id", TicketController.deleteTicket);

module.exports = router;
