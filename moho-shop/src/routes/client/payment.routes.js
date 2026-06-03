const express = require("express");
const router = express.Router();
const paymentController = require("../../controllers/client/payment.controller");
const paymentService = require("../../services/payment.service");

// Các endpoint gốc của bạn giữ nguyên 100%
router.get("/confirm", paymentController.confirmPage);
router.get("/checkout/bank-transfer/:orderId", paymentController.bankTransferPage);
router.post("/checkout/confirm-bank-transfer/:orderId", paymentController.confirmBankTransfer);
router.get("/checkout/check-status/:orderId", paymentController.checkPaymentStatus);

// Cổng tiếp nhận sự kiện khi bạn click nút duyệt trong Gmail (Dùng Callback)
router.get("/checkout/admin-approve/:id", (req, res) => {
    const orderId = req.params.id;

    paymentService.getOrderStatusById(orderId, (err, order) => {
        if (err || !order) return res.status(404).send("Đơn hàng không tồn tại.");

        if (order.payment_status === 'failed') {
            return res.send(`
                <div style="text-align: center; margin-top: 80px; font-family: sans-serif;">
                    <h2 style="color: #ff4d4f; font-size: 35px;">⚠️ ĐƠN HÀNG QUÁ HẠN!</h2>
                    <p>Đơn hàng #${orderId} đã quá hạn 5 phút và đã bị hệ thống tự động hủy từ trước.</p>
                    <button onclick="window.close()">Đóng tab</button>
                </div>
            `);
        }

        // Gọi dịch vụ cập nhật trạng thái đơn thành paid bằng Callback
        paymentService.approveOrderFromAdmin(orderId, (approveErr) => {
            if (approveErr) {
                return res.status(500).send("Lỗi hệ thống khi duyệt đơn: " + approveErr.message);
            }

            return res.send(`
                <div style="text-align: center; margin-top: 80px; font-family: sans-serif;">
                    <h2 style="color: #52c41a; font-size: 35px;">✓ DUYỆT ĐƠN THÀNH CÔNG!</h2>
                    <p>Đơn hàng #${orderId} đã được chuyển sang trạng thái thành công. Khách hàng đã được tự động điều hướng chuyển trang.</p>
                    <button style="padding: 10px 20px; background: #52c41a; color: white; border: none; cursor: pointer;" onclick="window.close()">Đóng tab này</button>
                </div>
            `);
        });
    });
});

module.exports = router;