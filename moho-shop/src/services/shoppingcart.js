const db = require("../config/db");

/* ======================
   GET CART BY CUSTOMER
====================== */

exports.getCartByCustomer = (customerId, callback) => {

    const sql = `
    SELECT

        ci.cart_item_id,
        ci.quantity,

        p.product_id,
        p.product_name,
        p.product_price,
        p.product_sale_price,
        p.product_stock_quantity,

        pi.image_url

    FROM cart_item ci

    JOIN cart c
    ON ci.cart_id = c.cart_id

    JOIN product p
    ON p.product_id = ci.product_id

    LEFT JOIN product_image pi
    ON pi.product_id = p.product_id
    AND pi.image_type='main'

    WHERE c.customer_id=?
    `;

    db.query(sql, [customerId], callback);
};

/* ======================
   UPDATE QUANTITY
====================== */

exports.updateQuantity = (
    productId,
    quantity,
    callback
) => {

    const sql = `
    UPDATE cart_item
    SET quantity=?
    WHERE product_id=?
    `;

    db.query(
        sql,
        [quantity, productId],
        callback
    );
};

/* ======================
   REMOVE ITEM
====================== */

exports.removeItem = (
    productId,
    callback
) => {

    db.query(
        `
        DELETE FROM cart_item
        WHERE product_id=?
        `,
        [productId],
        callback
    );
};

/* ======================
   GET PRODUCT STOCK
====================== */

exports.getProduct = (
    productId,
    callback
) => {

    db.query(
        `
        SELECT *
        FROM product
        WHERE product_id=?
        `,
        [productId],
        callback
    );
};
exports.addToCart = (
    customerId,
    productId,
    callback
) => {

    db.query(
        `
        SELECT *
        FROM cart
        WHERE customer_id=?
        `,
        [customerId],
        (err, rows) => {

            if (err) return callback(err);

            // chưa có cart
            if (rows.length === 0) {

                db.query(
                    `
                    INSERT INTO cart(customer_id)
                    VALUES(?)
                    `,
                    [customerId],
                    (err2, result) => {

                        if (err2)
                            return callback(err2);

                        insertItem(
                            result.insertId
                        );
                    }
                );
            }
            else {

                insertItem(
                    rows[0].cart_id
                );
            }
        }
    );

    function insertItem(cartId) {

        db.query(
            `
            SELECT *
            FROM cart_item
            WHERE cart_id=?
            AND product_id=?
            `,
            [cartId, productId],
            (err, rows) => {

                if (rows.length > 0) {

                    db.query(
                        `
                        UPDATE cart_item
                        SET quantity = quantity + 1
                        WHERE cart_item_id=?
                        `,
                        [rows[0].cart_item_id],
                        callback
                    );
                }
                else {

                    db.query(
                        `
                        INSERT INTO cart_item
                        (
                            cart_id,
                            product_id,
                            quantity
                        )
                        VALUES(?,?,1)
                        `,
                        [
                            cartId,
                            productId
                        ],
                        callback
                    );
                }
            }
        );
    }
};