// const multer = require("multer");
// const multerS3 = require("multer-s3");
// const { PutObjectCommand } = require("@aws-sdk/client-s3");
// const s3 = require("./awsS3");

// // Tự định nghĩa storage cho multer
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "temp/"); // Lưu tạm file trước khi upload lên S3
//   },
//   filename: (req, file, cb) => {
//     const fileName = `${Date.now()}-${file.originalname}`;
//     cb(null, fileName);
//   },
// });

// // Middleware multer
// const upload = multer({
//   storage,
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype.startsWith("image/")) {
//       cb(null, true);
//     } else {
//       cb(new Error("Chỉ cho phép upload file hình ảnh!"), false);
//     }
//   },
// });

// // Hàm upload file lên S3
// const uploadToS3 = async (file) => {
//   const fs = require("fs");
//   const fileStream = fs.createReadStream(file.path);

//   const params = {
//     Bucket: process.env.AWS_BUCKET_NAME,
//     Key: file.filename,
//     Body: fileStream,
//     ACL: "public-read", // Quyền truy cập công khai
//     ContentType: file.mimetype,
//   };

//   await s3.send(new PutObjectCommand(params));
//   return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.filename}`;
// };

// module.exports = { upload, uploadToS3 };
const multer = require("multer");
const multerS3 = require("multer-s3");
const s3 = require("./awsS3");

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
