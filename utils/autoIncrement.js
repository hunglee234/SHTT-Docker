const Counter = require("../models/Counter");
/**
 * Hàm tự động sinh mã với prefix và số thứ tự tăng dần.
 * @param {String} field - Trường cần tăng (ví dụ: 'staffCode').
 * @param {String} prefix - Tiền tố (ví dụ: 'KH').
 * @param {Number} length - Độ dài số thứ tự (ví dụ: 2 cho 01, 02...).
 * @returns {Promise<String>} - Mã tự động sinh (ví dụ: 'KH01').
 */
async function generateAutoCode(field, prefix, length = 2) {
  try {
    // Tìm hoặc tạo mới counter cho field
    const counter = await Counter.findOneAndUpdate(
      { field }, // Trường để quản lý giá trị tự tăng
      { $inc: { seq: 1 } }, // Tăng giá trị seq thêm 1
      { new: true, upsert: true } // Tạo mới nếu chưa tồn tại
    );

    // Format số thứ tự với số 0 ở bên trái
    const seqNumber = String(counter.seq).padStart(length, "0");
    return `${prefix}${seqNumber}`;
  } catch (error) {
    throw new Error(`Error generating auto code: ${error.message}`);
  }
}

module.exports = generateAutoCode;
