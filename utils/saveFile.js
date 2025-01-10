const File = require("../models/File");
/**
 * Hàm lưu file và trả về ID
 * @param {String} fileUrl - URL của file (có thể là URL từ S3, server, hoặc đường dẫn cục bộ)
 * @param {String} fileType - Loại file: 'image' hoặc 'pdf'
 * @returns {ObjectId} - ID của file vừa được lưu
 */
const saveFile = async (fileUrl, fileType) => {
  if (!fileUrl) {
    throw new Error("File URL is required!");
  }

  if (!fileType || !["image", "pdf"].includes(fileType)) {
    throw new Error("Invalid file type! Allowed types are 'image' and 'pdf'.");
  }

  const newFile = new File({ url: fileUrl, fileType });
  const savedFile = await newFile.save(); // Lưu file vào DB
  return savedFile._id; // Trả về ID của file
};

module.exports = { saveFile };
