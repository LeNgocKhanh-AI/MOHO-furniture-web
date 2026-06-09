const db = require("../config/db");

// Lấy danh sách size + phân trang + JOIN tên & giá gốc sản phẩm
const getSizes = async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    const query = `
    SELECT ps.*, p.product_name, p.product_price, p.product_sale_price
    FROM product_size ps
    LEFT JOIN product p ON ps.product_id = p.product_id
    ORDER BY ps.size_id DESC
    LIMIT ? OFFSET ?
`;
    const [rows] = await db.promise().query(query, [limit, offset]);
    return rows;
};

// Đếm tổng số size
const countSizes = async () => {
    const [rows] = await db
        .promise()
        .query("SELECT COUNT(*) as total FROM product_size");
    return rows[0].total;
};

// Thêm size mới + cập nhật tồn kho product
const createSize = async (data) => {
    const { product_id, size_name, extra_price, stock_quantity } = data;

    // Lấy giá gốc sản phẩm để tính price & sale_price
    const [[product]] = await db
        .promise()
        .query("SELECT product_price, product_sale_price FROM product WHERE product_id = ?", [product_id]);

    const price = parseFloat(product.product_price) + parseFloat(extra_price || 0);
    const sale_price = product.product_sale_price
        ? parseFloat(product.product_sale_price) + parseFloat(extra_price || 0)
        : null;

    await db.promise().query(
        `INSERT INTO product_size (product_id, size_name, extra_price, stock_quantity, price, sale_price)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [product_id, size_name, extra_price || 0, stock_quantity || 0, price, sale_price]
    );

    // Cập nhật tồn kho product = tổng tất cả size
    await syncStockToProduct(product_id);
};

// Cập nhật size + cập nhật tồn kho product
const updateSize = async (id, data) => {
    const { product_id, size_name, extra_price, stock_quantity } = data;

    // Lấy giá gốc sản phẩm
    const [[product]] = await db
        .promise()
        .query("SELECT product_price, product_sale_price FROM product WHERE product_id = ?", [product_id]);

    const price = parseFloat(product.product_price) + parseFloat(extra_price || 0);
    const sale_price = product.product_sale_price
        ? parseFloat(product.product_sale_price) + parseFloat(extra_price || 0)
        : null;

    await db.promise().query(
        `UPDATE product_size
         SET product_id = ?, size_name = ?, extra_price = ?, stock_quantity = ?, price = ?, sale_price = ?
         WHERE size_id = ?`,
        [product_id, size_name, extra_price || 0, stock_quantity || 0, price, sale_price, id]
    );

    // Cập nhật tồn kho product = tổng tất cả size
    await syncStockToProduct(product_id);
};

// Xóa size + cập nhật lại tồn kho product
const deleteSize = async (id) => {
    // Lấy product_id trước khi xóa
    const [[size]] = await db
        .promise()
        .query("SELECT product_id FROM product_size WHERE size_id = ?", [id]);

    if (!size) return;

    await db
        .promise()
        .query("DELETE FROM product_size WHERE size_id = ?", [id]);

    // Cập nhật lại tồn kho product sau khi xóa size
    await syncStockToProduct(size.product_id);
};

// Hàm nội bộ: đồng bộ tồn kho product = SUM(stock_quantity) của các size
const syncStockToProduct = async (product_id) => {
    await db.promise().query(
        `UPDATE product
         SET product_stock_quantity = (
             SELECT COALESCE(SUM(stock_quantity), 0)
             FROM product_size
             WHERE product_id = ?
         )
         WHERE product_id = ?`,
        [product_id, product_id]
    );
};

module.exports = {
    getSizes,
    countSizes,
    createSize,
    updateSize,
    deleteSize,
};