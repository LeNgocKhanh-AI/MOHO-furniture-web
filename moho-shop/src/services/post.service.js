const db = require("../config/db");

// 1. Lấy danh sách bài viết (Phân trang + JOIN lấy tên chuyên mục)
// Thay thế hàm getPosts cũ bằng hàm này:
const getPosts = async (page = 1, limit = 5) => {
    const offset = (page - 1) * limit;
    const query = `
        SELECT p.*, bc.name as cat_name 
        FROM posts p
        LEFT JOIN blog_categories bc ON p.category_id = bc.id
        ORDER BY p.id DESC
        LIMIT ? OFFSET ?
    `;
    const [rows] = await db.promise().query(query, [limit, offset]);
    return rows;
};

// 2. Tính tổng số lượng bài viết phục vụ phân trang
const getTotalPosts = async () => {
    const query = `SELECT COUNT(*) as total FROM posts`;
    const [rows] = await db.promise().query(query);
    return rows[0].total;
};

// 3. Lấy chi tiết bài viết theo ID
const getPostById = async (id) => {
    const query = `SELECT * FROM posts WHERE id = ?`;
    const [rows] = await db.promise().query(query, [id]);
    return rows[0];
};

// 4. Thêm mới bài viết
const createPost = async (data) => {
    const query = `
        INSERT INTO posts (title, thumbnail, content, category_id)
        VALUES (?, ?, ?, ?)
    `;
    const [result] = await db
        .promise()
        .query(query, [
            data.title,
            data.slug,
            data.thumbnail || null,
            data.content,
            data.category_id,
        ]);
    return result.insertId;
};

// 5. Cập nhật bài viết
// Cập nhật bài viết trong database
const updatePost = async (id, data) => {
    const query = `
        UPDATE posts
        SET title = ?, 
            slug = ?, 
            thumbnail = ?, 
            content = ?, 
            category_id = ?, 
            summary = ?
        WHERE id = ?
    `;

    // Truyền mảng dữ liệu tương ứng với các dấu hỏi chấm (?) phía trên
    await db.promise().query(query, [
        data.title,
        data.slug, // <-- Cập nhật dữ liệu slug vào đây
        data.thumbnail || null,
        data.content,
        data.category_id,
        data.summary || null,
        id, // ID nằm ở cuối cùng ứng với WHERE id = ?
    ]);
};

// 6. Xóa bài viết
const deletePost = async (id) => {
    const query = `DELETE FROM posts WHERE id = ?`;
    await db.promise().query(query, [id]);
};

module.exports = {
    getPosts,
    getTotalPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
};
