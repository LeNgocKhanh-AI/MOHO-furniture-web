const db = require("../config/db");

// Lấy danh sách đơn hàng + Họ tên khách hàng + Phân trang
const getOrders = async (page = 1, limit = 8) => {
    const offset = (page - 1) * limit;
    const query = `
    SELECT 
      o.*, 
      CONCAT(c.customer_lastname, ' ', c.customer_firstname) AS customer_name,
      c.customer_phone
    FROM orders o
    LEFT JOIN customer c ON o.customer_id = c.customer_id
    ORDER BY o.order_id DESC
    LIMIT ? OFFSET ?
  `;
    const [rows] = await db.promise().query(query, [limit, offset]);
    return rows;
};

// Đếm tổng số lượng đơn hàng để tính số trang
const countOrders = async () => {
    const [rows] = await db
        .promise()
        .query("SELECT COUNT(*) as total FROM orders");
    return rows[0].total;
};

module.exports = { getOrders, countOrders };
