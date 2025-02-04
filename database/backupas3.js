const AWS = require("aws-sdk");
require("dotenv").config();

// Cấu hình AWS SDK cho bucket nguồn
const s3Source = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID_SOURCE,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_SOURCE,
  region: process.env.AWS_REGION_SOURCE,
});

// Cấu hình AWS SDK cho bucket đích
const s3Dest = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID_DEST,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_DEST,
  region: process.env.AWS_REGION_DEST,
});

// Hàm sao chép toàn bộ dữ liệu từ bucket này sang bucket kia
const copyBucketData = async (sourceBucket, destinationBucket) => {
  try {
    // Lấy danh sách tất cả các đối tượng trong bucket nguồn
    const listParams = {
      Bucket: sourceBucket,
    };

    const listedObjects = await s3Source.listObjectsV2(listParams).promise();
    const objects = listedObjects.Contents;

    if (objects.length === 0) {
      console.log("No objects found in source bucket.");
      return;
    }

    for (let object of objects) {
      const copyParams = {
        Bucket: destinationBucket, // Bucket đích
        CopySource: `${sourceBucket}/${object.Key}`, // Bucket nguồn và tên file
        Key: object.Key, // Tên file trên bucket đích
      };

      await s3Dest.copyObject(copyParams).promise();
      console.log(`File copied: ${object.Key}`);
    }

    console.log("All objects copied successfully.");
  } catch (error) {
    console.error("Error copying files:", error);
  }
};

// Thực thi sao chép
const sourceBucket = "hung-bucket-234"; // Bucket nguồn
const destinationBucket = "sohuutritue"; // Bucket đích

copyBucketData(sourceBucket, destinationBucket);
