const express = require("express");
const { corsMiddleware, securityHeaders } = require("./middleware/corsConfig");
const passport = require("passport");
const connectDB = require("./config/db");
const app = express();
//Middleware
app.use(corsMiddleware);
app.use(securityHeaders);
app.use(express.json()); // Hỗ trợ application/json
const { ALL_ROLES } = require("./middleware/constants");
const { authenticateToken, authorizeRole } = require("./middleware/auth");
const adminRoutes = require("./routes/admin/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const managerRoutes = require("./routes/client/managerRoutes");
const userRoutes = require("./routes/user/routesUser");
// Middleware Passport
app.use(passport.initialize());

app.use("/", authRoutes);

//hahaha
// Route dành cho admin
app.use(
  "/admin",
  authenticateToken,
  authorizeRole(["Admin", "SuperAdmin"]),
  adminRoutes
);

// Route dành cho client
app.use(
  "/manager",
  authenticateToken,
  authorizeRole(["Admin", "Manager"]),
  managerRoutes
);

app.use("/user", authenticateToken, authorizeRole(ALL_ROLES), userRoutes);

connectDB(app);

module.exports = app;
