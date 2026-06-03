// const db =
//   require("../config/db");

// exports.createOrder =
//   (customerId, callback) => {

//     const orderSql = `
//     INSERT INTO orders
//     (
//         customer_id,
//         order_date,
//         order_status
//     )
//     VALUES
//     (
//         ?,
//         NOW(),
//         'pending'
//     )
//     `;

//     db.query(
//       orderSql,
//       [customerId],
//       (err, result) => {

//         if (err) {

//           return callback(err);
//         }

//         const orderId =
//           result.insertId;

//         db.query(
//           `
//                 SELECT
//                     ci.product_id,
//                     ci.quantity,
//                     p.product_price
//                 FROM cart_item ci
//                 JOIN cart c
//                 ON ci.cart_id=c.cart_id
//                 JOIN product p
//                 ON p.product_id=
//                 ci.product_id
//                 WHERE c.customer_id=?
//                 `,
//           [customerId],
//           (err, items) => {

//             if (err) {

//               return callback(err);
//             }

//             if (
//               items.length === 0
//             ) {

//               return callback(
//                 null,
//                 orderId
//               );
//             }

//             let done = 0;

//             items.forEach(
//               item => {

//                 db.query(
//                   `
//                         INSERT INTO
//                         order_detail
//                         (
//                             order_id,
//                             product_id,
//                             quantity,
//                             unit_price
//                         )
//                         VALUES
//                         (?,?,?,?)
//                         `,
//                   [
//                     orderId,
//                     item.product_id,
//                     item.quantity,
//                     item.product_price
//                   ],
//                   () => {

//                     done++;

//                     if (
//                       done ===
//                       items.length
//                     ) {

//                       db.query(
//                         `
//                                 DELETE ci
//                                 FROM cart_item ci
//                                 JOIN cart c
//                                 ON ci.cart_id=
//                                 c.cart_id
//                                 WHERE
//                                 c.customer_id=?
//                                 `,
//                         [
//                           customerId
//                         ]
//                       );

//                       callback(
//                         null,
//                         orderId
//                       );
//                     }
//                   });
//               });
//           });
//       });
//   };
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

/* ========================================================
   2. CÁC HÀM CHO CLIENT (DÙNG CALLBACK TRUYỀN THỐNG)
======================================================== */

const createOrder = (customerId, checkoutData, callback) => {
  db.query(
    `
    SELECT
        ci.product_id,
        ci.quantity,
        p.product_name,
        COALESCE(
            p.product_sale_price,
            p.product_price
        ) AS price,
        pi.image_url
    FROM cart_item ci
    JOIN cart c ON c.cart_id = ci.cart_id
    JOIN product p ON p.product_id = ci.product_id
    LEFT JOIN product_image pi ON pi.product_id = p.product_id AND pi.image_type='main'
    WHERE c.customer_id=?
    `,
    [customerId],
    (err, items) => {
      if (err) return callback(err);

      let total = 0;
      items.forEach((item) => {
        total += item.price * item.quantity;
      });

      const fullAddress =
        checkoutData.address +
        ", " +
        checkoutData.ward +
        ", " +
        checkoutData.district +
        ", " +
        checkoutData.province;

      db.query(
        `
        INSERT INTO orders
        (
            customer_id,
            order_date,
            order_status,
            total_amount,
            shipping_address
        )
        VALUES
        (
            ?,
            NOW(),
            'pending',
            ?,
            ?
        )
        `,
        [customerId, total, fullAddress],
        (err, orderResult) => {
          if (err) return callback(err);

          const orderId = orderResult.insertId;
          let count = 0;

          items.forEach((item) => {
            db.query(
              `
              INSERT INTO order_detail
              (
                  order_id,
                  product_id,
                  quantity,
                  unit_price
              )
              VALUES
              (?,?,?,?)
              `,
              [orderId, item.product_id, item.quantity, item.price],
              () => {
                count++;

                if (count === items.length) {
                  const order = {
                    order_id: orderId,
                    total_amount: total,
                    payment_method: checkoutData.paymentMethod,
                    customer_name: checkoutData.fullName,
                    customer_phone: checkoutData.phone,
                    customer_email: "",
                    shipping_address: fullAddress,
                  };

                  callback(null, {
                    order,
                    orderItems: items,
                  });
                }
              }
            );
          });
        }
      );
    }
  );
};
const updateCustomerPhone = (customerId, phone, callback) => {
  // Chỉ cập nhật nếu khách hàng chưa có số điện thoại (tránh ghi đè nếu đã có)
  const sql = `UPDATE customer SET customer_phone = ? WHERE customer_id = ? AND (customer_phone IS NULL OR customer_phone = '')`;
  db.query(sql, [phone, customerId], callback);
};

/* ========================================================
   3. EXPORT CHUNG MỘT KHỐI DUY NHẤT (QUAN TRỌNG)
======================================================== */
module.exports = {
  getOrders,
  countOrders,
  createOrder,
  updateCustomerPhone,
};