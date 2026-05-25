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

db.query(sql,[productId],callback);

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