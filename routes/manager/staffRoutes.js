// const express = require("express");
// const {
//   getAllStaff,
//   createStaff,
// } = require("../../controllers/managerController");
// const { verifyToken, isManager } = require("../../middleware/auth");
// const router = express.Router();

// router.get("/", verifyToken, isManager, getAllStaff);
// router.post("/", verifyToken, isManager, createStaff);

// module.exports = router;

const express = require("express");
const router = express.Router();

router.get("/dashboard", (req, res) => {
  res.json({ message: "Welcome to Manager Dashboard" });
});

module.exports = router;
