const db = require("../config/db");

// Lấy danh sách chi tiết đơn hàng + thông tin liên quan + phân trang
const getOrderDetails = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const query = `
    SELECT 
      od.id,
      od.order_id,
      od.quantity,
      od.unit_price,
      od.total_price,
      p.product_name,
      p.product_sku
    FROM order_detail od
    LEFT JOIN product p ON od.product_id = p.product_id
    ORDER BY od.id DESC
    LIMIT ? OFFSET ?
  `;
  const [rows] = await db.promise().query(query, [limit, offset]);
  return rows;
};

// Đếm tổng số dòng trong bảng chi tiết đơn hàng để phân trang
const countOrderDetails = async () => {
  const [rows] = await db
    .promise()
    .query("SELECT COUNT(*) as total FROM order_detail");
  return rows[0].total;
};

module.exports = { getOrderDetails, countOrderDetails };
