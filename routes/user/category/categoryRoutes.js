const express = require("express");
const router = express.Router();

const {
  getAllCategory,
  getCategoryById,
} = require("../../../controllers/service/categoryController");

router.get("/", getAllCategory);

router.get("/:id", getCategoryById);

module.exports = router;
