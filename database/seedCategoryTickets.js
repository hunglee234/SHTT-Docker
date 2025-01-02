const mongoose = require("mongoose");
const CategoryTicket = require("../models/Ticket/CategoryTicket");
const seedData = async () => {
  const categories = [
    {
      name: "Technical Support",
      description: "Support for technical issues.",
    },
    {
      name: "Billing",
      description: "Questions about billing and invoices.",
    },
    {
      name: "General Inquiry",
      description: "General questions and information.",
    },
  ];

  try {
    await mongoose.connect(
      "mongodb+srv://hung:hung@cluster0.vyvn6.mongodb.net/users234?retryWrites=true&w=majority&appName=Cluster0",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("Connected to MongoDB");

    // Clear existing data
    await CategoryTicket.deleteMany();
    console.log("Existing data cleared");

    // Insert new data
    await CategoryTicket.insertMany(categories);
    console.log("Seed data inserted successfully");

    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding data:", error);
    mongoose.connection.close();
  }
};

seedData();
