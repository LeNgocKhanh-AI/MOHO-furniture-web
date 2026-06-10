const db = require("../../config/db");

exports.getOrderAccountPage = (req, res) => {
    const customerId = req.session.customer
        ? req.session.customer.customer_id
        : null;
    if (!customerId) return res.redirect("/login");

    const sql = `
        SELECT o.order_id, o.order_date, o.order_status, 
               od.quantity, od.total_price,
               p.product_name, pi.image_url, ps.size_name
        FROM orders o
        JOIN order_detail od ON o.order_id = od.order_id
        JOIN product p ON od.product_id = p.product_id
        JOIN product_image pi ON p.product_id = pi.product_id AND pi.image_type = 'main'
        JOIN product_size ps ON od.size_id = ps.size_id
        WHERE o.customer_id = ? 
        ORDER BY o.order_date DESC
    `;

    db.query(sql, [customerId], (err, results) => {
        if (err) return res.status(500).send("Lỗi tải đơn hàng");

        // Gom nhóm đơn hàng
        const ordersGrouped = {};
        results.forEach((row) => {
            if (!ordersGrouped[row.order_id]) {
                ordersGrouped[row.order_id] = {
                    order_id: row.order_id,
                    order_date: row.order_date,
                    order_status: row.order_status,
                    items: [],
                };
            }
            ordersGrouped[row.order_id].items.push(row);
        });

        res.render("page/orderaccount", { orders: Object.values(ordersGrouped) });
    });
};

exports.confirmReceived = (req, res) => {
    const orderId = req.params.orderId;
    const customerId = req.session.customer
        ? req.session.customer.customer_id
        : null;

    // Sửa tên cột: order_status
    const sql =
        "UPDATE orders SET order_status = 'completed' WHERE order_id = ? AND customer_id = ?";
    db.query(sql, [orderId, customerId], (err) => {
        if (err) {
            console.error("Lỗi cập nhật trạng thái:", err);
            return res.status(500).send("Lỗi cập nhật");
        }
        res.redirect("/orderaccount");
    });
};