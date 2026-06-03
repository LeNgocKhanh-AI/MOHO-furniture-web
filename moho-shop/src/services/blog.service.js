const db = require("../config/db"); // Giữ nguyên file db.js gốc của bạn

// 1. Lấy thông tin 1 danh mục bằng slug
const getCategoryBySlug = async (slug) => {
    const [categories] = await db
        .promise()
        .query("SELECT * FROM blog_categories WHERE slug = ?", [slug]);
    return categories[0] || null;
};

// 2. Lấy tất cả danh mục blog (phục vụ hiển thị menu Sidebar)
const getAllCategories = async () => {
    const [categories] = await db
        .promise()
        .query("SELECT * FROM blog_categories");
    return categories;
};

// 3. Lấy danh sách bài viết mới nhất toàn hệ thống (hiển thị ở Sidebar)
const getRecentPosts = async (limit = 8) => {
    const [posts] = await db
        .promise()
        .query("SELECT * FROM posts ORDER BY created_at DESC LIMIT ?", [limit]);
    return posts;
};

// 4. Lấy danh sách bài viết theo category_id (Hiển thị ở trang danh sách loại)
const getPostsByCategoryId = async (categoryId) => {
    const [posts] = await db
        .promise()
        .query(
            "SELECT * FROM posts WHERE category_id = ? ORDER BY created_at DESC",
            [categoryId],
        );
    return posts;
};

// 5. Lấy chi tiết một bài viết bằng slug (Hiển thị trang đọc bài viết)
const getPostBySlug = async (slug) => {
    const [posts] = await db
        .promise()
        .query("SELECT * FROM posts WHERE slug = ?", [slug]);
    return posts[0] || null;
};

// Export dạng Object chứa các hàm rời - chuẩn gu của bạn
module.exports = {
    getCategoryBySlug,
    getAllCategories,
    getRecentPosts,
    getPostsByCategoryId,
    getPostBySlug,
};
