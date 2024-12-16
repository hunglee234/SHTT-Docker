const axios = require("axios");

// Thay đổi URL thành URL API của bạn
const BASE_URL = "http://localhost:3009/login";

async function testLogin() {
  try {
    const response = await axios.post(BASE_URL, {
      email: "admin@example.com",
      password: "admin123",
    });
    console.log("Login Successful:", response.data);
  } catch (error) {
    console.error(
      "Login Failed:",
      error.response ? error.response.data : error.message
    );
  }
}

testLogin();
