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
module.exports = router;