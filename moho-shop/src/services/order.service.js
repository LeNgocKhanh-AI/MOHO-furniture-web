
const db = require("../config/db");

/* ========================================================
   1. CÁC HÀM CHO ADMIN (DÙNG ASYNC/AWAIT & PROMISE)
======================================================== */

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


const createOrder = (customerId, checkoutData, cartItems, callback) => {

  // Tính tổng từ cartItems truyền vào (dùng cho cả guest lẫn login)
  let total = 0;
  cartItems.forEach(item => {
    const price = Number(item.product_sale_price || item.product_price || 0);
    total += price * Number(item.quantity);
  });

  const fullAddress =
    checkoutData.address + ", " +
    checkoutData.ward + ", " +
    checkoutData.district + ", " +
    checkoutData.province;

  // customerId null được — cho phép guest
  db.query(
    `INSERT INTO orders
        (customer_id, order_date, order_status, total_amount, shipping_address)
        VALUES (?, NOW(), 'pending', ?, ?)`,
    [customerId || null, total, fullAddress],
    (err, orderResult) => {
      if (err) return callback(err);

      const orderId = orderResult.insertId;
      let count = 0;

      if (cartItems.length === 0) {
        return callback(null, { order: buildOrderObj(orderId, total, checkoutData, fullAddress), orderItems: [] });
      }

      cartItems.forEach(item => {
        const unitPrice = Number(item.product_sale_price || item.product_price || 0);
        const sizeId = item.size_id || null;

        db.query(
          `INSERT INTO order_detail
                    (order_id, product_id, size_id, quantity, unit_price)
                    VALUES (?, ?, ?, ?, ?)`,
          [orderId, item.product_id, sizeId, item.quantity, unitPrice],
          (err) => {
            if (err) console.error("Lỗi insert order_detail:", err);
            count++;

            if (count === cartItems.length) {
              callback(null, {
                order: buildOrderObj(orderId, total, checkoutData, fullAddress),
                orderItems: cartItems
              });
            }
          }
        );
      });
    }
  );
};

function buildOrderObj(orderId, total, checkoutData, fullAddress) {
  return {
    order_id: orderId,
    total_amount: total,
    payment_method: checkoutData.paymentMethod,
    customer_name: checkoutData.fullName,
    customer_phone: checkoutData.phone,
    customer_email: checkoutData.email || "",
    shipping_address: fullAddress
  };
}
const updateCustomerPhone = (customerId, phone, callback) => {
  // Chỉ cập nhật nếu khách hàng chưa có số điện thoại (tránh ghi đè nếu đã có)
  const sql = `UPDATE customer SET customer_phone = ? WHERE customer_id = ? AND (customer_phone IS NULL OR customer_phone = '')`;
  db.query(sql, [phone, customerId], callback);
};

// Xóa đơn hàng và chi tiết đơn hàng tương ứng (Bản sửa lỗi không dùng getConnection)
const deleteOrder = async (orderId) => {
  try {
    // Sử dụng Promise để thực hiện tuần tự
    const promiseDb = db.promise();

    // 1. Xóa trong bảng payment (để giải phóng khóa ngoại)
    await promiseDb.query("DELETE FROM payment WHERE order_id = ?", [orderId]);

    // 2. Xóa trong bảng order_detail
    await promiseDb.query("DELETE FROM order_detail WHERE order_id = ?", [orderId]);

    // 3. Xóa đơn hàng chính trong bảng orders
    const [result] = await promiseDb.query("DELETE FROM orders WHERE order_id = ?", [orderId]);

    return result.affectedRows > 0;
  } catch (error) {
    console.error("Lỗi tại OrderService (deleteOrder):", error);
    throw error;
  }
};
// order.service.js


// Hàm lưu hoặc cập nhật địa chỉ
const saveOrUpdateAddress = (customerId, checkoutData, callback) => {
  const fullAddress = `${checkoutData.address}, ${checkoutData.ward}, ${checkoutData.district}, ${checkoutData.province}`;

  // Kiểm tra xem đã có địa chỉ trong bảng address chưa
  const checkSql = "SELECT address_id FROM address WHERE customer_id = ?";

  db.query(checkSql, [customerId], (err, results) => {
    if (err) return callback(err);

    if (results.length > 0) {
      // Đã có địa chỉ -> UPDATE
      const updateSql = "UPDATE address SET full_address = ?, phone = ? WHERE customer_id = ?";
      db.query(updateSql, [fullAddress, checkoutData.phone, customerId], callback);
    } else {
      // Chưa có địa chỉ -> INSERT
      const insertSql = "INSERT INTO address (customer_id, full_address, phone) VALUES (?, ?, ?)";
      db.query(insertSql, [customerId, fullAddress, checkoutData.phone], callback);
    }
  });
};
const createGuestCustomer = (
  firstName,
  lastName,
  email,
  phone,
  address,
  callback
) => {

  const username = `guest_${Date.now()}`;

  db.query(
    `
        INSERT INTO customer
        (
            customer_username,
            customer_password,
            customer_firstname,
            customer_lastname,
            customer_email,
            customer_phone,
            customer_address
        )
        VALUES
        (?, ?, ?, ?, ?, ?, ?)
        `,
    [
      username,
      "guest",
      firstName,
      lastName,
      email,
      phone,
      address
    ],
    callback
  );
};


// Thêm vào module.exports:
// getOrderItems,
/* ========================================================
   3. EXPORT CHUNG MỘT KHỐI DUY NHẤT (QUAN TRỌNG)
======================================================== */
module.exports = {
  getOrders,
  countOrders,
  createOrder,
  updateCustomerPhone,
  deleteOrder,
  saveOrUpdateAddress,
  createGuestCustomer
};