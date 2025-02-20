const Post = require("../../models/Posts");
const Account = require("../../models/Account/Account");
// Thêm tài liệu
exports.createPost = async (req, res) => {
  try {
    const namePost = req.body.name || [];
    const txtFile = req.file || {};
    const txtId = txtFile.location;
    const Posts = await Post.create({
      name: namePost,
      txtUrl: txtId,
    });
    res
      .status(201)
      .json({ message: "Tài liệu được tạo thành công!", data: Posts });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi tạo tài liệu!", error: error.message });
  }
};

// Sửa tài liệu
exports.updatePost = async (req, res) => {
  const { postId } = req.params;
  const namePost = req.body.name;
  const txtFile = req.file || {};
  const txtId = txtFile.location;

  try {
    const currentPost = await Post.findById(postId);
    if (!currentPost) {
      return res.status(404).json({ message: "Không tìm thấy bài viết!" });
    }

    const updatedData = {
      name: namePost || currentPost.name,
      txtUrl: txtId || currentPost.txtUrl,
    };

    const Posts = await Post.findByIdAndUpdate(postId, updatedData, {
      new: true,
    });

    res
      .status(200)
      .json({ message: "Bài viết được cập nhật thành công!", data: Posts });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi cập nhật bài viết!", error: error.message });
  }
};

// Xóa thủ tục
exports.deletePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;
  try {
    const account = await Account.findById(userId).populate("role");
    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    if (!account.role || account.role.name !== "SuperAdmin") {
      return res.status(403).json({ error: "Bạn không có quyền xóa bài viết" });
    }
    const Posts = await Post.findByIdAndDelete(postId);
    if (!Posts) {
      return res.status(404).json({ message: "Không tìm thấy bài viết!" });
    }
    res.status(200).json({ message: "Bài viết đã được xóa thành công!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi xóa bài viết!", error: error.message });
  }
};

// Xem danh sách thủ tục
exports.getAllPosts = async (req, res) => {
  try {
    const { search_value } = req.query;
    let PostQuery = {};

    if (
      search_value &&
      search_value.trim() !== "" &&
      search_value.trim() !== '""'
    ) {
      const cleanSearchValue = search_value.replace(/"/g, "").trim();
      PostQuery.name = { $regex: cleanSearchValue, $options: "i" };
    }

    const Posts = await Post.find(PostQuery).sort({
      createdAt: -1,
    });

    res.status(200).json({
      message: "Danh sách bài viết:",
      data: {
        posts: Posts,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách bài viết!",
      error: error.message,
    });
  }
};

// Xem chi tiết thủ tục theo ID
exports.getPostDetails = async (req, res) => {
  const { postId } = req.params;
  try {
    const Posts = await Post.findById(postId);
    if (!Posts) {
      return res.status(404).json({ message: "Không tìm thấy bài viết!" });
    }
    res
      .status(200)
      .json({ message: "Thông tin chi tiết bài viết:", data: Posts });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy chi tiết bài viết!",
      error: error.message,
    });
  }
};
