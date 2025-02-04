const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "trituesohuu3@gmail.com",
    pass: "stnx ouis rbrq btng",
  },
});

async function sendMail(to, subject, text) {
  const mailOptions = {
    from: '"Sở Hữu Trí Tuệ" <your-email@gmail.com>',
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
