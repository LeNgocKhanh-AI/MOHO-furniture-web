
const nodemailer = require("nodemailer");
const orderService = require("../../services/order.service");
const paymentService = require("../../services/payment.service");

// =============================
// MAIL CONFIG
// =============================
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// =============================
// CONFIRM PAGE
// =============================
exports.confirmPage = (req, res) => {

    const user = req.session.customer;
    const checkoutData = req.session.checkoutData;
    const cartItems = req.session.checkoutCart;

    if (!checkoutData || !cartItems) {
        return res.redirect("/checkout");
    }

    const customerId = user
        ? user.customer_id
        : checkoutData.customerId;

    orderService.createOrder(
        customerId,
        checkoutData,
        cartItems,
        (err, result) => {

            if (err) {
                console.error(err);
                return res.send("Lỗi tạo đơn hàng");
            }

            // Xóa giỏ hàng
            if (user) {
                const db = require("../../config/db");

                db.query(
                    `
                    DELETE ci
                    FROM cart_item ci
                    JOIN cart c
                        ON ci.cart_id = c.cart_id
                    WHERE c.customer_id = ?
                    `,
                    [user.customer_id]
                );

            } else {
                req.session.cart = [];
            }

            // Chỉ xóa cart
            req.session.checkoutCart = null;

            res.render("page/payment-confirm", {
                order: result.order,
                orderItems: result.orderItems
            });
        }
    );
};

// =============================
// BANK TRANSFER PAGE
// =============================
exports.bankTransferPage = (req, res) => {

    const orderId = req.params.orderId;

    const customerId =
        req.session.customer
            ? req.session.customer.customer_id
            : req.session.checkoutData?.customerId;

    if (!customerId) {
        return res.redirect("/checkout");
    }

    paymentService.getOrderWithCustomerInfo(
        orderId,

        (err, order) => {

            if (err) {
                console.error(err);
                return res.status(500).send("Lỗi lấy thông tin đơn hàng");
            }

            if (!order) {
                return res.send(
                    "Không tìm thấy đơn hàng hoặc bạn không có quyền truy cập."
                );
            }

            if (order.payment_status === "pending") {

                console.log(
                    `🚀 Khởi tạo luồng thanh toán cho đơn #${orderId}`
                );

                const approveLink =
                    `http://192.168.1.36:4000/checkout/admin-approve/${order.order_id}`;

                const mailOptions = {
                    from: `"Nội Thất MOHO" <${process.env.EMAIL_USER}>`,
                    to: process.env.EMAIL_USER,
                    subject:
                        `[Yêu cầu xác thực] Đơn hàng #${order.order_id}`,

                    html: `
                    <div style="font-family:sans-serif;padding:20px;">
                        <h3>Khách hàng vừa truy cập trang thanh toán.</h3>

                        <p><b>Mã đơn:</b> ${order.order_id}</p>
                        <p><b>Khách:</b> ${order.customer_name || "Khách vãng lai"}</p>
                        <p><b>SĐT:</b> ${order.customer_phone || ""}</p>
                        <p><b>Email:</b> ${order.customer_email || ""}</p>
                        <p><b>Địa chỉ:</b> ${order.shipping_address || ""}</p>

                        <p>
                            <b>Số tiền:</b>
                            ${Number(order.total_amount).toLocaleString("vi-VN")} đ
                        </p>

                        <p>
                            <b>Nội dung CK:</b>
                            MOHO ${order.order_id}
                        </p>

                        <br>

                        <a
                            href="${approveLink}"
                            style="
                                background:#52c41a;
                                color:white;
                                padding:12px 24px;
                                text-decoration:none;
                                border-radius:5px;
                            "
                        >
                            XÁC NHẬN ĐÃ NHẬN TIỀN
                        </a>
                    </div>
                    `
                };

                transporter.sendMail(
                    mailOptions,
                    (mailErr) => {
                        if (mailErr) {
                            console.log(mailErr.message);
                        }
                    }
                );

                paymentService.startTimeoutCounter(
                    orderId,
                    order.total_amount
                );
            }

            return res.render(
                "page/bank-transfer",
                {
                    order
                }
            );
        }
    );
};

// =============================
// CHECK STATUS
// =============================
exports.checkPaymentStatus = (req, res) => {

    const orderId = req.params.orderId;

    paymentService.getOrderStatusById(
        orderId,
        (err, order) => {

            if (err || !order) {
                return res.json({
                    status: "notfound"
                });
            }

            return res.json({
                status: order.payment_status
            });
        }
    );
};

// =============================
// CUSTOMER CONFIRM
// =============================
exports.confirmBankTransfer = (req, res) => {

    const orderId = req.params.orderId;

    const customerId =
        req.session.customer
            ? req.session.customer.customer_id
            : req.session.checkoutData?.customerId;

    if (!customerId) {
        return res.status(401).json({
            success: false,
            message: "Không xác định được khách hàng"
        });
    }

    paymentService.customerConfirmTransfer(
        orderId,
        customerId,
        (err) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    success: false,
                    message: "Lỗi hệ thống"
                });
            }

            return res.json({
                success: true,
                message: "Đã gửi xác nhận."
            });
        }
    );
};

// =============================
// ADMIN APPROVE
// =============================
exports.approveOrder = (req, res) => {

    const orderId = req.params.orderId;

    paymentService.approveAndReduceStock(
        orderId,
        (err) => {

            if (err) {
                console.error(err);

                return res.status(500).send(
                    "Có lỗi xảy ra."
                );
            }

            res.send(`
                <div style="text-align:center;margin-top:80px;font-family:sans-serif;">
                    <h1 style="color:#52c41a;">
                        ✅ Duyệt đơn thành công
                    </h1>

                    <p>
                        Đơn hàng #${orderId}
                        đã được xác nhận thanh toán.
                    </p>

                    <button
                        onclick="window.close()"
                        style="
                            padding:10px 20px;
                            cursor:pointer;
                        "
                    >
                        Đóng tab
                    </button>
                </div>
            `);
        }
    );
};

