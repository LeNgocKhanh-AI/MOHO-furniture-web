const db = require("../config/db");

const getProducts = async (page = 1, limit = 8) => {
  const offset = (page - 1) * limit;

  // LEFT JOIN với điều kiện lấy đúng ảnh chính (main) của sản phẩm
  const query = `
    SELECT 
      p.*, 
      pi.image_url AS product_image 
    FROM product p
    LEFT JOIN product_image pi ON p.product_id = pi.product_id AND pi.image_type = 'main'
    ORDER BY p.product_id DESC
    LIMIT ? OFFSET ?
  `;

  const [rows] = await db.promise().query(query, [limit, offset]);
  return rows;
};

const getTotalProducts = async () => {
  const query = `
    SELECT COUNT(*) as total
    FROM product
  `;

  const [rows] = await db.promise().query(query);

  return rows[0].total;
};

const getCategories = async () => {
  const query = `
    SELECT *
    FROM category
  `;

  const [rows] = await db.promise().query(query);

  return rows;
};

const createProduct = async (data) => {
  const query = `
    INSERT INTO product
    (
      product_name,
      category_id,
      product_price,
      product_sale_price,
      product_sku,
      product_stock_quantity,
      product_description,
      is_featured
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  await db
    .promise()
    .query(query, [
      data.product_name,

      data.category_id,

      data.product_price,

      data.product_sale_price || 0,

      data.product_sku,

      data.product_stock_quantity,

      data.product_description,

      data.is_featured ? 1 : 0,
    ]);
};

const getProductById = async (id) => {
  const query = `
    SELECT *
    FROM product
    WHERE product_id = ?
  `;

  const [rows] = await db.promise().query(query, [id]);

  return rows[0];
};

const updateProduct = async (id, data) => {
  const query = `
    UPDATE product
    SET
      product_name = ?,
      category_id = ?,
      product_price = ?,
      product_sale_price = ?,
      product_sku = ?,
      product_stock_quantity = ?,
      product_description = ?,
      is_featured = ?
    WHERE product_id = ?
  `;

  await db
    .promise()
    .query(query, [
      data.product_name,
      data.category_id,
      data.product_price,
      data.product_sale_price || 0,
      data.product_sku,
      data.product_stock_quantity,
      data.product_description,
      data.is_featured ? 1 : 0,
      id,
    ]);
};

// xóa
const deleteProduct = async (id) => {
  const query = `
    DELETE FROM product
    WHERE product_id = ?
  `;

  await db.promise().query(query, [id]);
};

module.exports = {
  getProducts,
  getCategories,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  getTotalProducts,
};
