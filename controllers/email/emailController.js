const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // Hoặc dịch vụ email khác như Yahoo, Outlook
  auth: {
    user: "Hunglk.tlu@gmail.com", // Thay bằng email của bạn
    pass: "vncq vdub roli whbp", // Thay bằng mật khẩu ứng dụng của bạn
  },
});

async function sendMail(to, subject, text) {
  const mailOptions = {
    from: '"Hùng LK" <your-email@gmail.com>',
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

module.exports = sendMail;
