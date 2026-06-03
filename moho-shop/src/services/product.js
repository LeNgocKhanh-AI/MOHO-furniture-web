const db = require("../config/db");

/* ===== GET ALL PRODUCTS ===== */

exports.getAllProducts = (callback) => {
  const sql = `
    SELECT 
        p.product_id,
        p.product_name,
        p.product_price,
        p.product_sale_price,
        pi.image_url,
        COALESCE(SUM(od.quantity), 0) AS total_sold,
        COALESCE(r.avg_rating, 0) AS avg_rating
    FROM product p

    /* ===== MAIN IMAGE ===== */
    LEFT JOIN product_image pi
        ON p.product_id = pi.product_id
        AND pi.image_type = 'main'

    /* ===== SOLD ===== */
    LEFT JOIN order_detail od
        ON p.product_id = od.product_id

    /* ===== AVG RATING ===== */
    LEFT JOIN (
        SELECT
            product_id,
            ROUND(AVG(rating),1) AS avg_rating
        FROM product_review
        GROUP BY product_id
    ) r
    ON p.product_id = r.product_id

    /* 🔥 SỬA TẠI ĐÂY: Lấy giá trị bằng 0 để cho phép đăng lên trang chính */
    WHERE p.is_featured = 0

    GROUP BY 
        p.product_id,
        p.product_name,
        p.product_price,
        p.product_sale_price,
        pi.image_url,
        r.avg_rating
    ORDER BY p.product_id DESC
  `;

  db.query(sql, callback);
};

/* ===== GET ALL REVIEWS ===== */

exports.getAllReviews = (callback) => {
  const sql = `

SELECT

    pr.review_id,
    pr.rating,
    pr.review_comment,
    pr.review_image,
    pr.anonymous,

    c.customer_username,

    p.product_name,

    pi.image_url AS product_image

FROM product_review pr

JOIN customer c
ON pr.customer_id = c.customer_id

JOIN product p
ON pr.product_id = p.product_id

LEFT JOIN product_image pi
ON p.product_id = pi.product_id
AND pi.image_type = 'main'

WHERE pr.review_image IS NOT NULL
AND pr.review_image != ''

ORDER BY pr.created_at DESC

`;

  db.query(sql, callback);
};
/* ===== PRODUCT DETAIL ===== */

exports.getProductDetail = (productId, callback) => {
  const sql = `

SELECT

    p.product_id,
    p.product_name,
    p.product_price,
    p.product_sale_price,
    p.product_sku,
    p.product_description,

    pi.image_url,
    pi.image_type,

    COALESCE(SUM(od.quantity),0) AS total_sold,

    COALESCE(r.avg_rating,0) AS avg_rating,

    COALESCE(r.total_reviews,0) AS total_reviews

FROM product p

LEFT JOIN product_image pi
ON p.product_id = pi.product_id

LEFT JOIN order_detail od
ON p.product_id = od.product_id

LEFT JOIN (

    SELECT

        product_id,

        ROUND(AVG(rating),1) AS avg_rating,

        COUNT(*) AS total_reviews

    FROM product_review

    GROUP BY product_id

) r

ON p.product_id = r.product_id

WHERE p.product_id = ?

GROUP BY
    p.product_id,
    p.product_name,
    p.product_price,
    p.product_sale_price,
    p.product_sku,
    p.product_description,
    pi.image_url,
    pi.image_type,
    r.avg_rating,
    r.total_reviews

`;

  db.query(sql, [productId], callback);
};
/* ===== SEARCH PRODUCTS ===== */

exports.searchProducts = (keyword, callback) => {
  const sql = `
SELECT 
  p.product_id,
  p.product_name,
  p.product_price,
  p.product_sale_price,

  pi.image_url,

  COALESCE(SUM(od.quantity), 0) AS total_sold,

  COALESCE(r.avg_rating, 0) AS avg_rating

FROM product p

LEFT JOIN product_image pi
  ON p.product_id = pi.product_id
  AND pi.image_type = 'main'

LEFT JOIN order_detail od
  ON p.product_id = od.product_id

LEFT JOIN (
  SELECT 
    product_id,
    ROUND(AVG(rating),1) AS avg_rating
  FROM product_review
  GROUP BY product_id
) r
ON p.product_id = r.product_id

WHERE 
  p.product_name LIKE ?
  OR p.product_sku LIKE ?

GROUP BY 
  p.product_id,
  p.product_name,
  p.product_price,
  p.product_sale_price,
  pi.image_url,
  r.avg_rating

LIMIT 8
`;

  db.query(sql, [`%${keyword}%`, `%${keyword}%`], callback);
};

/* ===== GET PRODUCTS WITH PAGINATION (2 DÒNG X 4 CỘT) ===== */
exports.getProductsPagination = (page, limit, callback) => {
  const offset = (page - 1) * limit;

  // 1. Câu lệnh đếm tổng số sản phẩm có điều kiện giống hệt hàm getAllProducts của bạn
  const sqlCount =
    "SELECT COUNT(*) AS total FROM product WHERE is_featured = 0";

  db.query(sqlCount, (err, countResult) => {
    if (err) return callback(err, null);

    const totalProducts = countResult[0].total;
    const totalPages = Math.ceil(totalProducts / limit);

    // 2. Câu lệnh lấy sản phẩm kèm LIMIT, OFFSET và giữ nguyên cấu trúc JOIN của bạn
    const sqlGetItems = `
      SELECT 
          p.product_id,
          p.product_name,
          p.product_price,
          p.product_sale_price,
          pi.image_url,
          COALESCE(SUM(od.quantity), 0) AS total_sold,
          COALESCE(r.avg_rating, 0) AS avg_rating
      FROM product p

      LEFT JOIN product_image pi
          ON p.product_id = pi.product_id
          AND pi.image_type = 'main'

      LEFT JOIN order_detail od
          ON p.product_id = od.product_id

      LEFT JOIN (
          SELECT
              product_id,
              ROUND(AVG(rating),1) AS avg_rating
          FROM product_review
          GROUP BY product_id
      ) r
      ON p.product_id = r.product_id

      WHERE p.is_featured = 0

      GROUP BY 
          p.product_id,
          p.product_name,
          p.product_price,
          p.product_sale_price,
          pi.image_url,
          r.avg_rating
      ORDER BY p.product_id DESC
      LIMIT ? OFFSET ?
    `;

    db.query(sqlGetItems, [limit, offset], (err, products) => {
      if (err) return callback(err, null);

      // Trả về kết quả hoàn chỉnh dưới dạng Object
      callback(null, {
        products: products,
        totalPages: totalPages,
      });
    });
  });
};

/* ===== GET PRODUCTS BY CATEGORY WITH PAGINATION ===== */
/* ===== GET PRODUCTS BY CATEGORY WITH PAGINATION (ĐÃ FIX THEO DB THẬT) ===== */
exports.getProductsByCategoryPagination = (
  categoryName,
  page,
  limit,
  callback,
) => {
  const offset = (page - 1) * limit;

  // 1. Câu lệnh đếm tổng số sản phẩm: Phải JOIN sang bảng category để lọc theo cat_name
  const sqlCount = `
    SELECT COUNT(*) AS total 
    FROM product p
    JOIN category c ON p.category_id = c.cat_id
    WHERE c.cat_name = ? AND p.is_featured = 0
  `;

  db.query(sqlCount, [categoryName], (err, countResult) => {
    if (err) return callback(err, null);

    const totalProducts = countResult[0].total;
    const totalPages = Math.ceil(totalProducts / limit);

    // 2. Câu lệnh lấy sản phẩm: Bổ sung JOIN category c để lọc c.cat_name = ?
    const sqlGetItems = `
      SELECT 
          p.product_id,
          p.product_name,
          p.product_price,
          p.product_sale_price,
          pi.image_url,
          COALESCE(SUM(od.quantity), 0) AS total_sold,
          COALESCE(r.avg_rating, 0) AS avg_rating
      FROM product p
      
      /* 🔥 JOIN THÊM BẢNG CATEGORY ĐỂ LỌC THEO TÊN DANH MỤC TIẾNG ANH/VIỆT */
      JOIN category c 
          ON p.category_id = c.cat_id

      LEFT JOIN product_image pi
          ON p.product_id = pi.product_id
          AND pi.image_type = 'main'
          
      LEFT JOIN order_detail od
          ON p.product_id = od.product_id
          
      LEFT JOIN (
          SELECT product_id, ROUND(AVG(rating),1) AS avg_rating
          FROM product_review
          GROUP BY product_id
      ) r
      ON p.product_id = r.product_id
      
      /* 🔥 ĐIỀU KIỆN LỌC: So khớp theo c.cat_name */
      WHERE c.cat_name = ? AND p.is_featured = 0
      
      GROUP BY 
          p.product_id, p.product_name, p.product_price, p.product_sale_price, pi.image_url, r.avg_rating
      ORDER BY p.product_id DESC
      LIMIT ? OFFSET ?
    `;

    db.query(sqlGetItems, [categoryName, limit, offset], (err, products) => {
      if (err) return callback(err, null);

      // Trả kết quả mượt mà về cho Controller
      callback(null, {
        products: products,
        totalPages: totalPages,
      });
    });
  });
};
