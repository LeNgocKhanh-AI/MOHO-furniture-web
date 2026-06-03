const express = require("express");
const router = express.Router();
const postController = require("../../controllers/admin/post.controller");

// Trang danh sách bài viết (Hiển thị + Phân trang)
router.get("/", postController.index);

// Xử lý thêm mới bài viết
router.post("/create", postController.create);

// Xử lý cập nhật bài viết
router.post("/edit/:id", postController.update);

// Xử lý xóa bài viết
router.get("/delete/:id", postController.deletePost);

module.exports = router;
