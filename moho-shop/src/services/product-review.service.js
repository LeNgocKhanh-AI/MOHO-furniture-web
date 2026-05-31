const db = require("../config/db");

// Lấy danh sách review + Phân trang + JOIN lấy tên sản phẩm & khách hàng
const getReviews = async (page = 1, limit = 5) => {
    const offset = (page - 1) * limit;
    // Đã bỏ loại JOIN lấy c.customer_name để tránh lỗi, thay vào đó chỉ lấy pr.customer_id
    const query = `
    SELECT pr.*, p.product_name 
    FROM product_review pr
    LEFT JOIN product p ON pr.product_id = p.product_id
    ORDER BY pr.created_at DESC
    LIMIT ? OFFSET ?
  `;
    const [rows] = await db.promise().query(query, [limit, offset]);
    return rows;
};

// Đếm tổng số đánh giá để phân trang
const countReviews = async () => {
    const [rows] = await db
        .promise()
        .query("SELECT COUNT(*) as total FROM product_review");
    return rows[0].total;
};

// Xóa đánh giá nếu vi phạm chính sách/thô tục
const deleteReview = async (id) => {
    const [result] = await db
        .promise()
        .query("DELETE FROM product_review WHERE review_id = ?", [id]);
    return result;
};

module.exports = { getReviews, countReviews, deleteReview };
