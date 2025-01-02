const mongoose = require("mongoose");
require("dotenv").config();
const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async (app) => {
  mongoose
    .connect(MONGODB_URI)
    .then(() => {
      console.log("Connected to MongoDB hehe...");
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}...`);
      });
    })
    .catch((err) => {
      console.error("Error connecting to MongoDB:", err);
    });
};

module.exports = connectDB;
