const express = require("express");
const router = express.Router();

const {
  getNotiList,
  getNotiDetail,
  getNewNotiCount,
} = require("../../controllers/noti/notiController");

router.get("/count", getNewNotiCount);
router.get("/", getNotiList);
router.get("/:notiid", getNotiDetail);

module.exports = router;
