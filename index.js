const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const config = require("./config");

const app = express();
const PORT = 3009;

app.use(express.json()); // Để xử lý dữ liệu JSON từ client

const adminRoutes = require("./routes/admin/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const managerRoutes = require("./routes/client/managerRoutes");

app.use("/auth", authRoutes);

// Route dành cho admin
app.use("/admin", adminRoutes);

// Route dành cho client
app.use("/manager", managerRoutes);

if (config.currentEnv !== "test") {
  mongoose
    .connect(
      "mongodb+srv://hung:hung@cluster0.vyvn6.mongodb.net/users?retryWrites=true&w=majority&appName=Cluster0"
    )
    .then(() => {
      console.log("Connected to MongoDB...");
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}...`);
      });
    })
    .catch((err) => {
      console.error("Error connecting to MongoDB:", err);
    });
}
module.exports = app;
