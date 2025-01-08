const Avatar = require("../models/Images/Avatar");

/**
 * Hàm lưu avatar và trả về ID
 * @param {String} avatarUrl - URL của avatar
 * @returns {ObjectId} - ID của avatar vừa được lưu
 */
const saveAvatar = async (avatarUrl) => {
  if (!avatarUrl) {
    throw new Error("Avatar URL is required!");
  }

  const newAvatar = new Avatar({ url: avatarUrl });
  const savedAvatar = await newAvatar.save();
  return savedAvatar._id; // Trả về ID của avatar
};

module.exports = { saveAvatar };
