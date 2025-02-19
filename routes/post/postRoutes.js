const express = require("express");
const router = express.Router();
const PostController = require("../../controllers/post/postController");
const upload = require("../../utils/multer");

// Thêm bài viết
router.post("/", upload.single("txtFile"), PostController.createPost);

// Sửa bài viết
router.put("/:postId", upload.single("txtFile"), PostController.updatePost);

// Xóa bài viết
router.delete("/:postId", PostController.deletePost);

// Xem danh sách bài viết
router.get("/", PostController.getAllPosts);

// Xem chi tiết bài viết theo ID
router.get("/:postId", PostController.getPostDetails);

module.exports = router;
