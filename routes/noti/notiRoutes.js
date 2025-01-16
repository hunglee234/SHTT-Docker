const express = require("express");
const router = express.Router();

const {
  getNotiList,
  getNotiDetail,
} = require("../../controllers/noti/notiController");

router.get("/", getNotiList);

router.get("/:notiid", getNotiDetail);

module.exports = router;
