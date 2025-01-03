const express = require("express");
const router = express.Router();

const {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
} = require("../../../controllers/service/serviceController");

router.post("/", createService);

router.get("/", getAllServices);

router.get("/:id", getServiceById);

router.put("/:id", updateService);

router.delete("/:id", deleteService);

module.exports = router;
