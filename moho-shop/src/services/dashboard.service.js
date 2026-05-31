// lấy thông tin để hiển thị lên dashboard

const db = require("../config/db");

const getDashboardStats = () => {
    return new Promise((resolve, reject) => {
        // SQL đếm users
        const sqlUsers = `
      SELECT COUNT(*) AS totalUsers
      FROM customer
    `;

        db.query(sqlUsers, (err, userResult) => {
            if (err) {
                reject(err);
            }

            // SQL đếm products
            const sqlProducts = `
        SELECT COUNT(*) AS totalProducts
        FROM product
      `;

            db.query(sqlProducts, (err, productResult) => {
                if (err) {
                    reject(err);
                }

                // SQL đếm orders
                const sqlOrders = `
          SELECT COUNT(*) AS totalOrders
          FROM orders
        `;

                db.query(sqlOrders, (err, orderResult) => {
                    if (err) {
                        reject(err);
                    }

                    // SQL đếm feedbacks
                    const sqlFeedbacks = `
            SELECT COUNT(*) AS totalFeedbacks
            FROM feedback
          `;

                    db.query(sqlFeedbacks, (err, feedbackResult) => {
                        if (err) {
                            reject(err);
                        }

                        // Gom dữ liệu
                        const stats = {
                            users: userResult[0].totalUsers,
                            products: productResult[0].totalProducts,
                            orders: orderResult[0].totalOrders,
                            feedbacks: feedbackResult[0].totalFeedbacks,
                        };

                        resolve(stats);
                    });
                });
            });
        });
    });
};

// Thống kê số lượng đơn hàng theo ngày

const getOrderChartData = async () => {
    const query = `
    SELECT 
      DATE(order_date) AS orderDay,
      COUNT(*) AS totalOrders
    FROM orders
    GROUP BY DATE(order_date)
    ORDER BY DATE(order_date) ASC
  `;

    const [rows] = await db.promise().query(query);

    return rows;
};

// THỐNG KÊ DOANH THU THEO NGÀY

const getRevenueChartData = async () => {
    const query = `
  
    SELECT 
      DATE(o.order_date) AS revenueDay,

      SUM(od.total_price) AS totalRevenue

    FROM orders o

    INNER JOIN order_detail od
      ON o.order_id = od.order_id

    WHERE o.order_status = 'completed'

    GROUP BY DATE(o.order_date)

    ORDER BY DATE(o.order_date) ASC

  `;

    const [rows] = await db.promise().query(query);

    return rows;
};

// THỐNG KÊ CUSTOMER THEO NGÀY

const getCustomerChartData = async () => {
    const query = `

    SELECT

      DATE(created_at) AS customerDay,

      COUNT(*) AS totalCustomers

    FROM customer

    GROUP BY DATE(created_at)

    ORDER BY DATE(created_at) ASC

  `;

    const [rows] = await db.promise().query(query);

    return rows;
};

module.exports = {
    getDashboardStats,
    getOrderChartData,
    getRevenueChartData,
    getCustomerChartData,
};
