const express = require("express");
const router = express.Router();
const orderDetailController = require("../../controllers/admin/orderdetail.controller");

// Tuyến đường dẫn chỉ xem danh sách chi tiết đơn hàng
router.get("/", orderDetailController.index);

module.exports = router;
