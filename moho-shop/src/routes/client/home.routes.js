const express = require("express");

const router = express.Router();

const homeController = require("../../controllers/client/homeController");

/* ===== HOME ===== */

router.get("/", homeController.home);

/* ===== PRODUCT DETAIL ===== */

router.get("/product/:id", homeController.detail);

/* ===== SEARCH ===== */

/* ===== ĐƯỜNG DẪN TÌM KIẾM MỚI (THAY CHO API CŨ) ===== */
router.get("/goi-y-tim-kiem", homeController.searchSuggest);
router.get("/search", homeController.searchPage);
router.get("/products/category/:categoryName", homeController.categoryPage);

// Khai báo đường dẫn /stores
router.get("/stores", (req, res) => {
    // Gọi lệnh render trỏ đúng vào thư mục `pages/stores` mà bạn đã cấu trúc ở bước 1
    res.render("page/stores", { session: req.session });
});

// Route hiển thị trang Về MOHO
router.get("/about", (req, res) => {
    res.render("page/about", { session: req.session });
});


module.exports = router;