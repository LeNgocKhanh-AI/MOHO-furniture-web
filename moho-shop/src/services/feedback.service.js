const db = require("../config/db");

// Lấy danh sách feedback + Phân trang
const getFeedbacks = async (page = 1, limit = 5) => {
    const offset = (page - 1) * limit;
    const query = `
    SELECT * FROM feedback 
    ORDER BY FIELD(status, 'new', 'read', 'replied', 'closed'), created_at DESC 
    LIMIT ? OFFSET ?
  `;
    const [rows] = await db.promise().query(query, [limit, offset]);
    return rows;
};

// Đếm tổng số lượng feedback để phân trang
const countFeedbacks = async () => {
    const [rows] = await db
        .promise()
        .query("SELECT COUNT(*) as total FROM feedback");
    return rows[0].total;
};

// Cập nhật trạng thái thành 'read' nếu trạng thái hiện tại đang là 'new'
const markAsRead = async (id) => {
    const query =
        "UPDATE feedback SET status = 'read' WHERE feedback_id = ? AND status = 'new'";
    const [result] = await db.promise().query(query, [id]);
    return result;
};

const deleteFeedback = async (id) => {
    const [result] = await db
        .promise()
        .query("DELETE FROM feedback WHERE feedback_id = ?", [id]);
    return result;
};

module.exports = { getFeedbacks, countFeedbacks, markAsRead, deleteFeedback };
