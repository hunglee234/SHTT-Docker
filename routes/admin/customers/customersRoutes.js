const express = require("express");
const router = express.Router();

const {
    listCustomers,
    listCustomersSearch
} = require("../../../controllers/customer/customerController");

router.get("/list", listCustomers);

router.get("/list-search", listCustomersSearch);

module.exports = router;
