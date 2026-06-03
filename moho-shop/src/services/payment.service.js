const db = require("../config/db");

// 1. Hàm tạo hành vi payment THÀNH CÔNG (HÀM GỐC CỦA BẠN - ĐỔI VỀ CALLBACK)
exports.createPayment = (orderId, amount, method, callback) => {
    db.query(
        `INSERT INTO payment (order_id, payment_method, amount, status) VALUES (?, ?, ?, 'success')`,
        [orderId, method, amount],
        (err, result) => {
            if (err) return callback(err, null);
            return callback(null, result.insertId);
        }
    );
};

// 2. Lấy thông tin đơn hàng và thông tin Customer (Ghép chuỗi họ tên bằng CONCAT)
exports.getOrderWithCustomerInfo = (orderId, customerId, callback) => {
    const query = `
        SELECT 
            o.order_id, 
            o.total_amount, 
            o.payment_status,
            o.shipping_address,
            CONCAT(IFNULL(c.customer_lastname,''), ' ', IFNULL(c.customer_firstname,'')) AS customer_name, 
            c.customer_phone, 
            c.customer_email 
        FROM orders o
        JOIN customer c ON o.customer_id = c.customer_id
        WHERE o.order_id = ? AND o.customer_id = ?
    `;
    db.query(query, [orderId, customerId], (err, rows) => {
        if (err) return callback(err, null);
        return callback(null, rows[0] || null);
    });
};

// 3. Lấy trạng thái đơn hàng nhanh theo ID (Phục vụ polling check-status)
exports.getOrderStatusById = (orderId, callback) => {
    db.query("SELECT payment_status, total_amount FROM orders WHERE order_id = ?", [orderId], (err, rows) => {
        if (err) return callback(err, null);
        return callback(null, rows[0] || null);
    });
};

// 4. Xử lý khi khách bấm nút chủ động báo "Tôi đã chuyển khoản" trên giao diện Web
exports.customerConfirmTransfer = (orderId, customerId, callback) => {
    db.query("UPDATE orders SET payment_status = 'pending' WHERE order_id = ? AND customer_id = ?", [orderId, customerId], (err) => {
        if (err) return callback(err);

        db.query("SELECT payment_id FROM payment WHERE order_id = ?", [orderId], (pErr, existing) => {
            if (pErr) return callback(pErr);

            if (existing.length > 0) {
                db.query("UPDATE payment SET status = 'pending' WHERE order_id = ?", [orderId], callback);
            } else {
                db.query(`INSERT INTO payment (order_id, payment_method, amount, status) 
                          SELECT order_id, 'bank', total_amount, 'pending' FROM orders WHERE order_id = ?`, [orderId], callback);
            }
        });
    });
};

// 5. Câu lệnh SQL hủy đơn khi hết 5 phút ngầm
exports.cancelOrderOnTimeout = (orderId, totalAmount, callback) => {
    db.query("UPDATE orders SET payment_status = 'failed' WHERE order_id = ?", [orderId], (err) => {
        if (err) return callback ? callback(err) : console.error(err);

        db.query("SELECT payment_id FROM payment WHERE order_id = ?", [orderId], (pErr, existing) => {
            if (pErr) return callback ? callback(pErr) : console.error(pErr);

            if (existing.length > 0) {
                db.query("UPDATE payment SET status = 'failed' WHERE order_id = ?", [orderId], callback);
            } else {
                db.query(`INSERT INTO payment (order_id, payment_method, amount, status) VALUES (?, 'bank', ?, 'failed')`, [orderId, totalAmount], callback);
            }
        });
    });
};

// 6. Câu lệnh SQL cập nhật khi bạn bấm duyệt thành công từ link trong Gmail
exports.approveOrderFromAdmin = (orderId, callback) => {
    db.query("UPDATE orders SET payment_status = 'paid' WHERE order_id = ?", [orderId], (err) => {
        if (err) return callback(err);

        db.query("SELECT total_amount FROM orders WHERE order_id = ?", [orderId], (amountErr, rows) => {
            if (amountErr) return callback(amountErr);
            const totalAmount = rows[0]?.total_amount || 0;

            db.query("SELECT payment_id FROM payment WHERE order_id = ?", [orderId], (pErr, existing) => {
                if (pErr) return callback(pErr);

                if (existing.length > 0) {
                    db.query("UPDATE payment SET status = 'success', amount = ? WHERE order_id = ?", [totalAmount, orderId], callback);
                } else {
                    db.query(`INSERT INTO payment (order_id, payment_method, amount, status) VALUES (?, 'bank', ?, 'success')`, [orderId, totalAmount], callback);
                }
            });
        });
    });
};

// 7. Bộ hẹn giờ 5 phút chạy ngầm tự động hủy đơn hàng bằng Callback lồng
exports.startTimeoutCounter = (orderId, totalAmount) => {
    setTimeout(() => {
        console.log(`⏱️ Tiến hành check đơn tự động sau 5 phút cho mã #${orderId}...`);

        exports.getOrderStatusById(orderId, (err, order) => {
            if (!err && order && order.payment_status === 'pending') {
                exports.cancelOrderOnTimeout(orderId, totalAmount, (cancelErr) => {
                    if (!cancelErr) console.log(`❌ Đơn hàng #${orderId} đã tự động hủy thành công do hết 5 phút.`);
                });
            }
        });
    }, 5 * 60 * 1000); // Đếm ngược 5 phút ngầm
};