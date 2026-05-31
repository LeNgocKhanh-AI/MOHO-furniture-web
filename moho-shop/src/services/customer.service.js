const db = require("../config/db");

// Lấy danh sách khách hàng + Phân trang
const getCustomers = async (page = 1, limit = 5) => {
    const offset = (page - 1) * limit;
    const query =
        "SELECT * FROM customer ORDER BY customer_id DESC LIMIT ? OFFSET ?";
    const [rows] = await db.promise().query(query, [limit, offset]);
    return rows;
};

// Đếm tổng số khách hàng để phân trang
const countCustomers = async () => {
    const [rows] = await db
        .promise()
        .query("SELECT COUNT(*) as total FROM customer");
    return rows[0].total;
};

// Xóa tài khoản khách hàng
const deleteCustomer = async (id) => {
    const [result] = await db
        .promise()
        .query("DELETE FROM customer WHERE customer_id = ?", [id]);
    return result;
};

module.exports = { getCustomers, countCustomers, deleteCustomer };
