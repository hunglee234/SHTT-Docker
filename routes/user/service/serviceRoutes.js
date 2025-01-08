const express = require("express");
const router = express.Router();

const {
  getAllServices,
  getServiceById,
} = require("../../../controllers/service/serviceController");

router.get("/", getAllServices);

router.get("/:id", getServiceById);

module.exports = router;
