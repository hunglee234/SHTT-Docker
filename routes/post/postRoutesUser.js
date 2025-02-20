const express = require("express");
const router = express.Router();
const PostController = require("../../controllers/post/postController");

// Xem danh sách bài viết
router.get("/", PostController.getAllPosts);

// Xem chi tiết bài viết theo ID
router.get("/:postId", PostController.getPostDetails);

module.exports = router;
