const express = require("express");
const router = express.Router();
const categoryController = require("../../controllers/admin/category.controller");

// 1. Trang danh sách danh mục (Hiển thị + Phân trang)
router.get("/", categoryController.index);

// 2. Xử lý thêm mới danh mục
router.post("/create", categoryController.create);

// 3. Lấy form sửa danh mục (nếu bạn cần render trang riêng, hoặc dùng để bổ trợ modal)
router.get("/edit/:id", categoryController.editForm);

// 4. Xử lý cập nhật danh mục
router.post("/edit/:id", categoryController.update);

// 5. Xử lý xóa danh mục
router.get("/delete/:id", categoryController.deleteCategory);

module.exports = router;
