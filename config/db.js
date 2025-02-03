const mongoose = require("mongoose");
require("dotenv").config();
const MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async (app) => {
  mongoose
    .connect(MONGODB_URI)
    .then(() => {
      console.log("Connected to MongoDB hehe...");
      const PORT = process.env.PORT || 3009;
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}...`);
      });
    })
    .catch((err) => {
      console.error("Error connecting to MongoDB:", err);
    });
};

module.exports = connectDB;
