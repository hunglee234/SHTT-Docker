const passport = require("passport");
const express = require("express");
const router = express.Router();
const facebookController = require("../../controllers/facebook/facebookController");

router.get("/auth", facebookController.facebookLogin);

// Callback Facebook nhận mã code và xử lý
router.get("/callback", facebookController.facebookCallback);

module.exports = router;
