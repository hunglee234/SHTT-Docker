const multer = require("multer");
const multerS3 = require("multer-s3");
const s3 = require("../config/awsS3");

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    key: (req, file, cb) => {
      const fileName = `${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ cho phép upload file hình ảnh!"), false);
    }
  },
});

module.exports = upload;
