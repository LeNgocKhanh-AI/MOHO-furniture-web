const db = require("../config/db");

/* =========================
   CREATE PAYMENT
========================= */
exports.createPayment = (orderId, amount, method, callback) => {
    db.query(
        `INSERT INTO payment
        (order_id, payment_method, amount, status)
        VALUES (?, ?, ?, 'success')`,
        [orderId, method, amount],
        (err, result) => {
            if (err) return callback(err);
            callback(null, result.insertId);
        }
    );
};


/* =========================
   LẤY THÔNG TIN ĐƠN HÀNG
   (LOGIN + GUEST)
========================= */
exports.getOrderWithCustomerInfo = (orderId, callback) => {

    const sql = `
        SELECT
            o.order_id,
            o.total_amount,
            o.payment_status,
            o.shipping_address,

            CONCAT(
                IFNULL(c.customer_lastname,''),
                ' ',
                IFNULL(c.customer_firstname,'')
            ) AS customer_name,

            c.customer_phone,
            c.customer_email

        FROM orders o

        LEFT JOIN customer c
            ON o.customer_id = c.customer_id

        WHERE o.order_id = ?
    `;

    db.query(sql, [orderId], (err, rows) => {
        if (err) return callback(err);

        callback(null, rows[0] || null);
    });
};


/* =========================
   CHECK STATUS
========================= */
exports.getOrderStatusById = (orderId, callback) => {

    db.query(
        `SELECT payment_status,total_amount
         FROM orders
         WHERE order_id = ?`,
        [orderId],
        (err, rows) => {

            if (err) return callback(err);

            callback(null, rows[0] || null);
        }
    );

};


/* =========================
   KHÁCH BẤM ĐÃ CHUYỂN KHOẢN
========================= */
exports.customerConfirmTransfer = (
    orderId,
    customerId,
    callback
) => {

    let sql = "";
    let params = [];

    if (customerId) {
        sql =
            `UPDATE orders
             SET payment_status='pending'
             WHERE order_id=?
             AND customer_id=?`;

        params = [orderId, customerId];
    } else {
        sql =
            `UPDATE orders
             SET payment_status='pending'
             WHERE order_id=?`;

        params = [orderId];
    }

    db.query(sql, params, (err) => {

        if (err) return callback(err);

        db.query(
            `SELECT payment_id
             FROM payment
             WHERE order_id=?`,
            [orderId],
            (err2, rows) => {

                if (err2)
                    return callback(err2);

                if (rows.length > 0) {

                    db.query(
                        `UPDATE payment
                         SET status='pending'
                         WHERE order_id=?`,
                        [orderId],
                        callback
                    );

                } else {

                    db.query(
                        `INSERT INTO payment
                        (order_id,payment_method,amount,status)
                        SELECT
                            order_id,
                            'bank',
                            total_amount,
                            'pending'
                        FROM orders
                        WHERE order_id=?`,
                        [orderId],
                        callback
                    );

                }
            }
        );
    });
};


/* =========================
   HỦY ĐƠN SAU 5 PHÚT
========================= */
exports.cancelOrderOnTimeout = (
    orderId,
    totalAmount,
    callback
) => {

    db.query(
        `UPDATE orders
         SET payment_status='failed'
         WHERE order_id=?`,
        [orderId],
        (err) => {

            if (err)
                return callback(err);

            db.query(
                `SELECT payment_id
                 FROM payment
                 WHERE order_id=?`,
                [orderId],
                (err2, rows) => {

                    if (err2)
                        return callback(err2);

                    if (rows.length > 0) {

                        db.query(
                            `UPDATE payment
                             SET status='failed'
                             WHERE order_id=?`,
                            [orderId],
                            callback
                        );

                    } else {

                        db.query(
                            `INSERT INTO payment
                            (order_id,payment_method,amount,status)
                            VALUES
                            (?, 'bank', ?, 'failed')`,
                            [orderId, totalAmount],
                            callback
                        );

                    }

                }
            );

        }
    );

};


/* =========================
   ADMIN DUYỆT
========================= */
exports.approveOrderFromAdmin = (
    orderId,
    callback
) => {

    db.query(
        `UPDATE orders
         SET payment_status='paid'
         WHERE order_id=?`,
        [orderId],
        (err) => {

            if (err)
                return callback(err);

            db.query(
                `SELECT total_amount
                 FROM orders
                 WHERE order_id=?`,
                [orderId],
                (err2, rows) => {

                    if (err2)
                        return callback(err2);

                    const amount =
                        rows[0]?.total_amount || 0;

                    db.query(
                        `SELECT payment_id
                         FROM payment
                         WHERE order_id=?`,
                        [orderId],
                        (err3, paymentRows) => {

                            if (err3)
                                return callback(err3);

                            if (
                                paymentRows.length > 0
                            ) {

                                db.query(
                                    `UPDATE payment
                                     SET status='success',
                                     amount=?
                                     WHERE order_id=?`,
                                    [amount, orderId],
                                    callback
                                );

                            } else {

                                db.query(
                                    `INSERT INTO payment
                                    (order_id,payment_method,amount,status)
                                    VALUES
                                    (?, 'bank', ?, 'success')`,
                                    [orderId, amount],
                                    callback
                                );

                            }

                        }
                    );

                }
            );

        }
    );

};


/* =========================
   ĐẾM NGƯỢC 5 PHÚT
========================= */
exports.startTimeoutCounter = (
    orderId,
    totalAmount
) => {

    setTimeout(() => {

        exports.getOrderStatusById(
            orderId,
            (err, order) => {

                if (
                    !err &&
                    order &&
                    order.payment_status === "pending"
                ) {

                    exports.cancelOrderOnTimeout(
                        orderId,
                        totalAmount,
                        () => {
                            console.log(
                                `❌ Đơn ${orderId} hết hạn`
                            );
                        }
                    );

                }

            }
        );

    }, 5 * 60 * 1000);

};


/* =========================
   DUYỆT + TRỪ KHO
========================= */
exports.approveAndReduceStock = (
    orderId,
    callback
) => {

    db.getConnection((err, conn) => {

        if (err)
            return callback(err);

        conn.beginTransaction((err) => {

            if (err) {
                conn.release();
                return callback(err);
            }

            conn.query(
                `UPDATE orders
                 SET order_status='completed',
                     payment_status='paid'
                 WHERE order_id=?`,
                [orderId],
                (err) => {

                    if (err)
                        return conn.rollback(() => {
                            conn.release();
                            callback(err);
                        });

                    conn.query(
                        `
                        UPDATE product p
                        JOIN order_detail od
                        ON p.product_id = od.product_id
                        SET p.product_stock_quantity =
                            p.product_stock_quantity - od.quantity
                        WHERE od.order_id = ?
                        `,
                        [orderId],
                        (err) => {

                            if (err)
                                return conn.rollback(() => {
                                    conn.release();
                                    callback(err);
                                });

                            conn.commit((err) => {
                                conn.release();
                                callback(err);
                            });

                        }
                    );

                }
            );

        });

    });

};