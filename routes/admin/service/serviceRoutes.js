const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  authorizeRole,
} = require("../../../middleware/auth");

const {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
} = require("../../../controllers/service/serviceController");

router.post("/", authenticateToken, authorizeRole(["Admin"]), createService);

router.get("/", authenticateToken, authorizeRole(["Admin"]), getAllServices);

router.get("/:id", authenticateToken, authorizeRole(["Admin"]), getServiceById);

// router.put("/staff/:id", updateStaffInfo);
router.put("/:id", authenticateToken, authorizeRole(["Admin"]), updateService);

// Xóa cả User + InfoUser
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole(["Admin"]),
  deleteService
);

module.exports = router;
