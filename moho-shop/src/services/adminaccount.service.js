const db = require("../config/db"); // Đảm bảo đúng số cấp dấu chấm (../../) tùy vị trí đặt file

// Lấy danh sách admin + phân trang
const getAdmins = async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    const query = `
    SELECT 
      admin_id,
      admin_username,
      admin_firstname,
      admin_lastname,
      admin_email,
      admin_address,
      admin_phone
    FROM administrator
    ORDER BY admin_id ASC
    LIMIT ? OFFSET ?
  `;
    const [rows] = await db.promise().query(query, [limit, offset]);
    return rows;
};

// Đếm tổng số lượng admin
const countAdmins = async () => {
    const [rows] = await db
        .promise()
        .query("SELECT COUNT(*) as total FROM administrator");
    return rows[0].total;
};

module.exports = { getAdmins, countAdmins };
