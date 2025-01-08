const express = require("express");
const { corsMiddleware, securityHeaders } = require("./middleware/corsConfig");
const passport = require("passport");
require("./config/passportGG");
const connectDB = require("./config/db");
const app = express();
//Middleware
app.use(corsMiddleware);
app.use(securityHeaders);
app.use(express.json());
const { ALL_ROLES } = require("./middleware/constants");
const { authenticateToken, authorizeRole } = require("./middleware/auth");
const adminRoutes = require("./routes/admin/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const managerRoutes = require("./routes/client/managerRoutes");
const serviceRoutes = require("./routes/sevice/serviceRouter");
const userRoutes = require("./routes/user/routesUser");
// const profileRoutes = require("./routes/profile/profileRouter");
// const uploadRoutes = require("./routes/upload");
// Middleware Passport
app.use(passport.initialize());

app.use("/", authRoutes);

// Route dành cho admin
app.use("/admin", authenticateToken, authorizeRole(["Admin"]), adminRoutes);

// Route dành cho client
// Bổ sung authenticateToken, authorizeRole(["ManagerManager"])
app.use(
  "/manager",
  authenticateToken,
  authorizeRole(["Admin", "Manager"]),
  managerRoutes
);

// Client
app.use("/user", authenticateToken, authorizeRole(ALL_ROLES), userRoutes);
//  cơ chế JWT (JSON Web Token) để xác thực.
// Route dịch vụ (Yêu cầu xác thực)
app.use("/service", serviceRoutes);

// Route hồ sơ (Yêu cầu xác thực)
// app.use("/profile", profileRoutes);

// app.use("/api", uploadRoutes);

connectDB(app);
// Cấu hình CORS

module.exports = app;
