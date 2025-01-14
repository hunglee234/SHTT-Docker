const express = require("express");
const router = express.Router();
const upload = require("../../../utils/multer");

const {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  getServiceByUserId,
} = require("../../../controllers/service/serviceController");

//update ảnh
router.post("/", upload.single("image"), createService);

router.get("/", getAllServices);

router.get("/:id", getServiceById);

//update ảnh
router.put("/:id", upload.single("image"), updateService);

router.delete("/:id", deleteService);

router.get("/u/:userId", getServiceByUserId);

module.exports = router;
