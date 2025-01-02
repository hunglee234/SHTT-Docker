const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
require("./config/passportGG");
const connectDB = require("./config/db");
const app = express();
app.use(express.json()); // Để xử lý dữ liệu JSON từ client

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
app.use("/admin", adminRoutes);

// Route dành cho client
app.use("/manager", managerRoutes);

app.use("/user", userRoutes);
//  cơ chế JWT (JSON Web Token) để xác thực.
// Route dịch vụ (Yêu cầu xác thực)
app.use("/service", serviceRoutes);

// Route hồ sơ (Yêu cầu xác thực)
// app.use("/profile", profileRoutes);

// app.use("/api", uploadRoutes);
//
connectDB(app);

module.exports = app;
