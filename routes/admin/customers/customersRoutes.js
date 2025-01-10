const express = require("express");
const router = express.Router();

const {
    listCustomers,
} = require("../../../controllers/customer/customerController");

router.post("/list", listCustomers);

module.exports = router;
