const db = require("../config/db");

// 1. Lấy danh sách danh mục (có phân trang)
const getCategories = async (page = 1, limit = 5) => {
  const offset = (page - 1) * limit;

  const query = `
    SELECT *
    FROM category
    ORDER BY cat_id DESC
    LIMIT ? OFFSET ?
  `;

  const [rows] = await db.promise().query(query, [limit, offset]);
  return rows;
};

// 2. Lấy tổng số lượng danh mục (để phục vụ phân trang ở FE)
const getTotalCategories = async () => {
  const query = `
    SELECT COUNT(*) as total
    FROM category
  `;

  const [rows] = await db.promise().query(query);
  return rows[0].total;
};

// 3. Lấy tất cả danh mục (Không phân trang - dùng để hiển thị select-box khi tạo/sửa sản phẩm)
const getAllCategoriesWithoutPagination = async () => {
  const query = `
    SELECT cat_id, cat_name FROM category ORDER BY cat_name ASC
  `;
  const [rows] = await db.promise().query(query);
  return rows;
};

// 4. Lấy chi tiết một danh mục theo ID
const getCategoryById = async (id) => {
  const query = `
    SELECT *
    FROM category
    WHERE cat_id = ?
  `;

  const [rows] = await db.promise().query(query, [id]);
  return rows[0];
};

// 5. Thêm mới danh mục
const createCategory = async (data) => {
  const query = `
    INSERT INTO category (cat_name, cat_desc)
    VALUES (?, ?)
  `;

  const [result] = await db
    .promise()
    .query(query, [data.cat_name, data.cat_desc || null]);

  return result.insertId; // Trả về ID của danh mục vừa tạo
};

// 6. Cập nhật danh mục
const updateCategory = async (id, data) => {
  const query = `
    UPDATE category
    SET cat_name = ?, cat_desc = ?
    WHERE cat_id = ?
  `;

  await db.promise().query(query, [data.cat_name, data.cat_desc || null, id]);
};

// 7. Xóa danh mục
const deleteCategory = async (id) => {
  const query = `
    DELETE FROM category
    WHERE cat_id = ?
  `;

  await db.promise().query(query, [id]);
};

module.exports = {
  getCategories,
  getTotalCategories,
  getAllCategoriesWithoutPagination,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
