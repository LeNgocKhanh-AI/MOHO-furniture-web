const db = require("../config/db");

// Lấy danh sách ảnh + Phân trang + JOIN lấy tên sản phẩm hiển thị
const getImages = async (page = 1, limit = 5) => {
    const offset = (page - 1) * limit;
    const query = `
    SELECT img.*, p.product_name 
    FROM product_image img
    LEFT JOIN product p ON img.product_id = p.product_id
    ORDER BY img.image_id DESC
    LIMIT ? OFFSET ?
  `;
    const [rows] = await db.promise().query(query, [limit, offset]);
    return rows;
};

// Đếm tổng số lượng ảnh phục vụ phân trang
const countImages = async () => {
    const [rows] = await db
        .promise()
        .query("SELECT COUNT(*) as total FROM product_image");
    return rows[0].total;
};

// Thêm ảnh mới
const createImage = async (data) => {
    const { product_id, image_url, image_type, display_order } = data;
    const query =
        "INSERT INTO product_image (product_id, image_url, image_type, display_order) VALUES (?, ?, ?, ?)";
    const [result] = await db
        .promise()
        .query(query, [product_id, image_url, image_type, display_order || 0]);
    return result;
};

// Cập nhật thông tin ảnh
const updateImage = async (id, data) => {
    const { product_id, image_url, image_type, display_order } = data;
    const query =
        "UPDATE product_image SET product_id = ?, image_url = ?, image_type = ?, display_order = ? WHERE image_id = ?";
    const [result] = await db
        .promise()
        .query(query, [product_id, image_url, image_type, display_order, id]);
    return result;
};

// Xóa ảnh
const deleteImage = async (id) => {
    const [result] = await db
        .promise()
        .query("DELETE FROM product_image WHERE image_id = ?", [id]);
    return result;
};

module.exports = {
    getImages,
    countImages,
    createImage,
    updateImage,
    deleteImage,
};
