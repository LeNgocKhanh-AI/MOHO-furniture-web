const express = require("express");
const router = express.Router();
const orderController = require("../../controllers/admin/order.controller");

// Trang hiển thị danh sách đơn hàng gốc của bạn
router.get("/", orderController.index);

// 🔥 Đường dẫn API lấy danh sách món đồ phục vụ cho gọi dữ liệu ngầm (AJAX)
router.get("/api/items", orderController.getItemsApi);

module.exports = router;
