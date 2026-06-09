// const db = require("../config/db");

// /* ======================
//    GET CART BY CUSTOMER
// ====================== */

// exports.getCartByCustomer = (customerId, callback) => {

//     const sql = `
//     SELECT

//         ci.cart_item_id,
//         ci.quantity,
//         ci.size_id,

//         p.product_id,
//         p.product_name,
//         p.product_price,
//         p.product_sale_price,
//         p.product_stock_quantity,

//         ps.size_name,

//         pi.image_url

//     FROM cart_item ci

//     JOIN cart c
//     ON ci.cart_id = c.cart_id

//     JOIN product p
//     ON p.product_id = ci.product_id

//     LEFT JOIN product_size ps
//     ON ps.size_id = ci.size_id

//     LEFT JOIN product_image pi
//     ON pi.product_id = p.product_id
//     AND pi.image_type='main'

//     WHERE c.customer_id=?
//     `;

//     db.query(sql, [customerId], callback);
// };

// /* ======================
//    UPDATE QUANTITY
// ====================== */

// exports.updateQuantity = (
//     productId,
//     quantity,
//     callback
// ) => {

//     const sql = `
//     UPDATE cart_item
//     SET quantity=?
//     WHERE product_id=?
//     `;

//     db.query(
//         sql,
//         [quantity, productId],
//         callback
//     );
// };

// /* ======================
//    REMOVE ITEM
// ====================== */

// exports.removeItem = (
//     productId,
//     callback
// ) => {

//     db.query(
//         `
//         DELETE FROM cart_item
//         WHERE product_id=?
//         `,
//         [productId],
//         callback
//     );
// };

// /* ======================
//    GET PRODUCT STOCK
// ====================== */

// exports.getProduct = (
//     productId,
//     callback
// ) => {

//     db.query(
//         `
//         SELECT *
//         FROM product
//         WHERE product_id=?
//         `,
//         [productId],
//         callback
//     );
// };

// /* ======================
//    ADD TO CART
// ====================== */

// exports.addToCart = (
//     customerId,
//     productId,
//     sizeId,
//     callback
// ) => {

//     db.query(
//         `
//         SELECT *
//         FROM cart
//         WHERE customer_id=?
//         `,
//         [customerId],
//         (err, rows) => {

//             if (err) return callback(err);

//             // chưa có cart
//             if (rows.length === 0) {

//                 db.query(
//                     `
//                     INSERT INTO cart(customer_id)
//                     VALUES(?)
//                     `,
//                     [customerId],
//                     (err2, result) => {

//                         if (err2)
//                             return callback(err2);

//                         insertItem(
//                             result.insertId
//                         );
//                     }
//                 );
//             }
//             else {

//                 insertItem(
//                     rows[0].cart_id
//                 );
//             }
//         }
//     );

//     function insertItem(cartId) {

//         db.query(
//             `
//             SELECT *
//             FROM cart_item
//             WHERE cart_id=?
//             AND product_id=?
//             AND size_id=?
//             `,
//             [
//                 cartId,
//                 productId,
//                 sizeId
//             ],
//             (err, rows) => {

//                 if (err) {
//                     return callback(err);
//                 }

//                 if (rows.length > 0) {

//                     db.query(
//                         `
//                         UPDATE cart_item
//                         SET quantity = quantity + 1
//                         WHERE cart_item_id=?
//                         `,
//                         [rows[0].cart_item_id],
//                         callback
//                     );
//                 }
//                 else {

//                     db.query(
//                         `
//                         INSERT INTO cart_item
//                         (
//                             cart_id,
//                             product_id,
//                             size_id,
//                             quantity
//                         )
//                         VALUES(?,?,?,1)
//                         `,
//                         [
//                             cartId,
//                             productId,
//                             sizeId
//                         ],
//                         callback
//                     );
//                 }
//             }
//         );
//     }
// };
// exports.getGuestCart = (cart, callback) => {

//     if (!cart || cart.length === 0) {
//         return callback([]);
//     }

//     const productIds = cart.map(i => i.productId);

//     const sql = `
//         SELECT 
//             p.product_id,
//             p.product_name,
//             p.product_price,
//             p.product_sale_price,
//             pi.image_url
//         FROM product p
//         LEFT JOIN product_image pi 
//             ON pi.product_id = p.product_id 
//             AND pi.image_type='main'
//         WHERE p.product_id IN (?)
//     `;

//     db.query(sql, [productIds], (err, rows) => {

//         if (err) return callback([]);

//         const result = cart.map(c => {

//             const p = rows.find(r => r.product_id === c.productId);

//             return {
//                 ...p,
//                 quantity: c.quantity,
//                 size_id: c.sizeId
//             };
//         });

//         callback(result);
//     });
// };
// exports.addGuestCart = (session, productId, sizeId, callback) => {

//     if (!session.cart) {
//         session.cart = [];
//     }

//     const cart = session.cart;

//     const existing = cart.find(i =>
//         i.productId === productId &&
//         i.sizeId === sizeId
//     );

//     if (existing) {
//         existing.quantity += 1;
//     } else {
//         cart.push({
//             productId,
//             sizeId,
//             quantity: 1
//         });
//     }

//     callback();
// };
const db = require("../config/db");

/* ======================
   GET CART BY CUSTOMER (LOGIN)
====================== */

exports.getCartByCustomer = (customerId, callback) => {
    const sql = `
    SELECT
        ci.cart_item_id,
        ci.quantity,
        ci.size_id,

        p.product_id,
        p.product_name,
        p.product_stock_quantity,

        ps.size_name,
        ps.price        AS product_price,
        ps.sale_price   AS product_sale_price,

        pi.image_url

    FROM cart_item ci

    JOIN cart c
        ON ci.cart_id = c.cart_id

    JOIN product p
        ON p.product_id = ci.product_id

    LEFT JOIN product_size ps
        ON ps.size_id = ci.size_id
       AND ps.product_id = p.product_id

    LEFT JOIN product_image pi
        ON pi.product_id = p.product_id
       AND pi.image_type = 'main'

    WHERE c.customer_id = ?
    `;
    db.query(sql, [customerId], callback);
};

/* ======================
   UPDATE QUANTITY (LOGIN)
====================== */

exports.updateQuantity = (productId, sizeId, quantity, callback) => {
    const sql = `
    UPDATE cart_item
    SET    quantity  = ?
    WHERE  product_id = ?
    AND    size_id    = ?
    `;
    db.query(sql, [quantity, productId, sizeId], callback);
};

/* ======================
   REMOVE ITEM (LOGIN)
====================== */

exports.removeItem = (productId, sizeId, callback) => {
    const sql = `
    DELETE FROM cart_item
    WHERE product_id = ?
    AND   size_id    = ?
    `;
    db.query(sql, [productId, sizeId], callback);
};


/* ======================
   GET PRODUCT
====================== */

exports.getProduct = (productId, callback) => {

    db.query(
        `
        SELECT *
        FROM product
        WHERE product_id = ?
        `,
        [productId],
        callback
    );
};


/* ======================
   ADD TO CART (LOGIN)
====================== */

exports.addToCart = (customerId, productId, sizeId, callback) => {

    db.query(
        `
        SELECT *
        FROM cart
        WHERE customer_id = ?
        `,
        [customerId],
        (err, rows) => {

            if (err) return callback(err);

            // tạo cart nếu chưa có
            if (rows.length === 0) {

                db.query(
                    `
                    INSERT INTO cart(customer_id)
                    VALUES(?)
                    `,
                    [customerId],
                    (err2, result) => {

                        if (err2) return callback(err2);

                        insertItem(result.insertId);
                    }
                );

            } else {
                insertItem(rows[0].cart_id);
            }
        }
    );

    function insertItem(cartId) {

        db.query(
            `
            SELECT *
            FROM cart_item
            WHERE cart_id = ?
            AND product_id = ?
            AND size_id = ?
            `,
            [cartId, productId, sizeId],
            (err, rows) => {

                if (err) return callback(err);

                if (rows.length > 0) {

                    db.query(
                        `
                        UPDATE cart_item
                        SET quantity = quantity + 1
                        WHERE cart_item_id = ?
                        `,
                        [rows[0].cart_item_id],
                        callback
                    );

                } else {

                    db.query(
                        `
                        INSERT INTO cart_item
                        (
                            cart_id,
                            product_id,
                            size_id,
                            quantity
                        )
                        VALUES (?, ?, ?, 1)
                        `,
                        [cartId, productId, sizeId],
                        callback
                    );
                }
            }
        );
    }
};


/* ======================
   GET GUEST CART
====================== */

exports.getGuestCart = (cart, callback) => {
    if (!cart || cart.length === 0) return callback([]);

    const sql = `
        SELECT p.product_id, p.product_name, 
               ps.size_id, ps.size_name, 
               ps.price as product_price,       -- Lấy giá từ size
               ps.sale_price as product_sale_price, -- Lấy giá sale từ size
               ps.stock_quantity as product_stock_quantity, 
               pi.image_url
        FROM product p
        LEFT JOIN product_image pi ON pi.product_id = p.product_id AND pi.image_type = 'main'
        JOIN product_size ps ON ps.product_id = p.product_id -- JOIN để lấy giá theo size
        WHERE p.product_id IN (?)`;

    const productIds = cart.map(i => i.productId);

    db.query(sql, [productIds], (err, rows) => {
        if (err) return callback([]);

        const result = cart.map(c => {
            // Lọc chính xác sản phẩm + size
            const p = rows.find(r =>
                r.product_id === c.productId &&
                r.size_id === Number(c.sizeId)
            );

            // Nếu không tìm thấy giá theo size, lấy giá mặc định của sản phẩm
            return {
                ...p,
                quantity: c.quantity,
                size_id: c.sizeId
            };
        });
        callback(result);
    });
};

/* ======================
   ADD GUEST CART
====================== */

/* ======================
   ADD GUEST CART (Đã sửa)
====================== */
exports.addGuestCart = (session, productId, sizeId, callback) => {
    if (!session.cart) session.cart = [];

    // Chuyển về Number để so sánh
    const pId = parseInt(productId);
    const sId = parseInt(sizeId);

    const existing = session.cart.find(i =>
        parseInt(i.productId) === pId &&
        parseInt(i.sizeId) === sId
    );

    if (existing) {
        existing.quantity += 1;
    } else {
        session.cart.push({
            productId: pId,
            sizeId: sId,
            quantity: 1
        });
    }
    callback();
};

/* ======================
   REMOVE GUEST CART (Đã sửa)
====================== */
exports.removeGuestCart = (session, productId, sizeId, callback) => {
    if (!session.cart) session.cart = [];

    const pId = parseInt(productId);
    const sId = parseInt(sizeId);

    // SỬA: Ép kiểu các phần tử trong mảng session để so sánh
    session.cart = session.cart.filter(i =>
        !(parseInt(i.productId) === pId && parseInt(i.sizeId) === sId)
    );

    callback();
};

/* ======================
   UPDATE GUEST CART
====================== */

exports.updateGuestCart = (session, productId, sizeId, quantity, callback) => {

    if (!session.cart) session.cart = [];

    const item = session.cart.find(i =>
        i.productId === productId &&
        i.sizeId === sizeId
    );

    if (item) {
        item.quantity = quantity;
    }

    callback();
};

/* ======================
   GET PRODUCT WITH SIZE (cho buyNow)
====================== */
exports.getProductWithSize = (productId, sizeId, callback) => {
    const sql = `
        SELECT
            p.product_id,
            p.product_name,
            ps.size_id,
            ps.size_name,
            ps.price        AS product_price,
            ps.sale_price   AS product_sale_price,
            pi.image_url
        FROM product p
        JOIN product_size ps
            ON ps.product_id = p.product_id
            AND ps.size_id = ?
        LEFT JOIN product_image pi
            ON pi.product_id = p.product_id
            AND pi.image_type = 'main'
        WHERE p.product_id = ?
    `;
    db.query(sql, [sizeId, productId], callback);
};