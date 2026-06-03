const nodemailer = require('nodemailer');
const orderService = require("../../services/order.service");
const paymentService = require("../../services/payment.service");

// 💡 Cấu hình bộ gửi thư sử dụng tài khoản Gmail (Lấy từ .env)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 1. URL: GET /confirm (Giữ nguyên luồng gốc của bạn)
exports.confirmPage = (req, res) => {
    const user = req.session.customer;
    const checkoutData = req.session.checkoutData;

    if (!user || !checkoutData) {
        return res.redirect("/checkout");
    }

    orderService.createOrder(user.customer_id, checkoutData, (err, result) => {
        if (err) {
            console.error("Lỗi tạo đơn hàng:", err);
            return res.send("Lỗi tạo đơn hàng");
        }

        res.render("page/payment-confirm", {
            order: result.order,
            orderItems: result.orderItems
        });
    });
};

// 2. URL: GET /checkout/bank-transfer/:orderId
exports.bankTransferPage = (req, res) => {
    const orderId = req.params.orderId;
    const user = req.session.customer;

    if (!user) return res.redirect("/login");

    // Gọi dịch vụ dạng Callback truyền thống để lấy thông tin đơn hàng đã gộp tên c.customer_lastname và c.customer_firstname
    paymentService.getOrderWithCustomerInfo(orderId, user.customer_id, (err, order) => {
        if (err) {
            console.error("Lỗi xử lý DB tại bankTransferPage:", err);
            return res.status(500).send("Lỗi hệ thống khi lấy thông tin đơn hàng");
        }

        if (!order) {
            return res.send("Không tìm thấy đơn hàng hoặc bạn không có quyền truy cập");
        }

        // 🔥 GỬI EMAIL VÀ HẸN GIỜ TỰ ĐỘNG TẠI CONTROLLER KHI KHÁCH VỪA VÀO TRANG NGÂN HÀNG
        if (order.payment_status === 'pending') {
            console.log(`🚀 Kích hoạt luồng thông báo gửi mail và hẹn giờ tự động cho đơn #${orderId}`);

            // Thay đổi link cũ thành IP thực tế của máy tính bạn
            const approveLink = `http://192.168.1.36:4000/checkout/admin-approve/${order.order_id}`;

            const mailOptions = {
                from: `"Nội Thất MOHO" <${process.env.EMAIL_USER}>`,
                to: process.env.EMAIL_USER,
                subject: `[Yêu cầu xác thực] Đơn hàng #${order.order_id} chuyển khoản chờ duyệt`,
                html: `
                    <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #eee; border-radius: 10px;">
                        <h3 style="color: #d46b08; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">Khách hàng vừa vào trang quét mã thanh toán!</h3>
                        <p><b>Mã đơn hàng:</b> ${order.order_id}</p>
                        <p><b>Khách hàng:</b> ${order.customer_name || 'Khách vãng lai'}</p>
                        <p><b>Số điện thoại:</b> ${order.customer_phone || 'Không có'}</p>
                        <p><b>Email khách:</b> ${order.customer_email || 'Không có'}</p>
                        <p><b>Địa chỉ nhận hàng:</b> ${order.shipping_address || 'Nhận tại cửa hàng'}</p>
                        <p><b>Số tiền cần thanh toán:</b> <strong style="color: #ff4d4f;">${Number(order.total_amount).toLocaleString('vi-VN')} đ</strong></p>
                        <p><b>Cú pháp chuyển khoản:</b> <span style="background: #fffbe6; padding: 2px 8px; border: 1px dashed #ffe58f; font-weight: bold;">MOHO ${order.order_id}</span></p>
                        <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 20px 0;"/>
                        <p style="color: #666; font-size: 13px;">Hệ thống đang đếm ngược 5 phút tự động. Hãy check số dư tài khoản ngân hàng thực tế, nếu nhận đủ tiền hãy bấm nút dưới đây:</p>
                        <a href="${approveLink}" style="background-color: #52c41a; color: white; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block; margin-top: 10px; text-align: center;">
                            ✓ XÁC NHẬN ĐÃ NHẬN ĐƯỢC TIỀN
                        </a>
                    </div>
                `
            };

            // Thực thi gửi mail ngầm (Dùng callback để bắt lỗi không làm sập luồng chính)
            transporter.sendMail(mailOptions, (mailErr, info) => {
                if (mailErr) {
                    console.error("❌ Lỗi cấu hình gửi mail tại Controller:", mailErr.message);
                } else {
                    console.log(`✉️ Mail thông báo đơn hàng #${orderId} gửi đi thành công!`);
                }
            });

            // Kích hoạt bộ đếm ngược 5 phút tự động hủy đơn ngầm
            paymentService.startTimeoutCounter(orderId, order.total_amount);
        }

        // Render giao diện trả về cho trình duyệt của khách
        return res.render("page/bank-transfer", { order });
    });
};

// 3. URL: GET /api/checkout/check-status/:orderId (Polling tự động quét nhảy trang)
exports.checkPaymentStatus = (req, res) => {
    const orderId = req.params.orderId;

    paymentService.getOrderStatusById(orderId, (err, order) => {
        if (err || !order) {
            return res.status(404).json({ status: 'notfound' });
        }
        return res.json({ status: order.payment_status });
    });
};

// 4. URL: POST /api/checkout/confirm-bank-transfer/:orderId (Nút bấm thủ công của khách)
exports.confirmBankTransfer = (req, res) => {
    const orderId = req.params.orderId;
    const user = req.session.customer;

    if (!user) {
        return res.status(401).json({ success: false, message: "Chưa đăng nhập" });
    }

    paymentService.customerConfirmTransfer(orderId, user.customer_id, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Lỗi hệ thống khi cập nhật trạng thái" });
        }
        return res.json({ success: true, message: "Yêu cầu xác nhận đã được gửi thành công!" });
    });
};