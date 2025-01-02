const express = require("express");
const upload = require("../config/multer");
// console.log(upload);
const Image = require("../models/image");

const router = express.Router();

router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Không có file được upload!" });
    }

    // Lưu thông tin vào MongoDB
    const newImage = new Image({
      fileName: req.file.key, // Tên file trong S3
      fileUrl: req.file.location, // URL file từ S3
    });

    await newImage.save();

    res.status(200).json({
      message: "Upload thành công!",
      fileUrl: req.file.location,
      data: newImage,
    });
  } catch (error) {
    console.error("Lỗi upload file:", error);
    res.status(500).json({ error: "Đã xảy ra lỗi khi upload file!" });
  }
  //   return res.json({
  //     message: "nnini",
  //   });
});
console.log("Router upload đã được khởi tạo");

module.exports = router;
