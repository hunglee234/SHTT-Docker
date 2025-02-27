const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "trituesohuu3@gmail.com",
    pass: "stnx ouis rbrq btng",
  },
});

/**
 * Gửi email chung
 * @param {string} to - Địa chỉ email người nhận
 * @param {string} subject - Tiêu đề email
 * @param {string} text - Nội dung email
 */
const sendMail = async (to, subject, text) => {
  const mailOptions = {
    from: `\"Sở Hữu Trí Tuệ\" <${process.env.EMAIL_USER}>`,
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
};

/**
 * Gửi email khi trạng thái hồ sơ thay đổi
 * @param {string} to - Địa chỉ email người nhận
 * @param {string} status - Trạng thái mới của hồ sơ
 */
const sendStatusEmail = async (to, status) => {
  const subject = "Cập nhật trạng thái hồ sơ";
  const text = `Trạng thái hồ sơ của bạn đã được cập nhật thành: "${status}".
  Vui lòng kiểm tra để biết thêm chi tiết.`;
  await sendMail(to, subject, text);
};

/**
 * Gửi email khi thông tin hồ sơ được cập nhật
 * @param {string} to - Địa chỉ email người nhận
 */
const sendProfileUpdatedEmail = async (to) => {
  const subject = "Hồ sơ của bạn đã được cập nhật";
  const text = `Thông tin hồ sơ của bạn đã được cập nhật thành công.  
  Vui lòng kiểm tra để xác nhận.`;
  await sendMail(to, subject, text);
};

module.exports = { sendMail, sendStatusEmail, sendProfileUpdatedEmail };
