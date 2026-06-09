const express = require("express");
const router = express.Router();
const orderController = require("../../controllers/admin/order.controller");

// Trang hiển thị danh sách đơn hàng gốc của bạn
router.get("/", orderController.index);

// 🔥 Đường dẫn API lấy danh sách món đồ phục vụ cho gọi dữ liệu ngầm (AJAX)
router.get("/api/items", orderController.getItemsApi);

// 🔥 Đường dẫn API xử lý xóa đơn hàng theo mã định danh ID
router.delete("/api/delete/:id", orderController.deleteOrderApi);


module.exports = router;
