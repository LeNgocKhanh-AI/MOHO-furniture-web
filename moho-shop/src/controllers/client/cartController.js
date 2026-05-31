const cartService =
    require("../../services/shoppingcart");

/* ======================
   CART PAGE
====================== */

exports.cartPage = (req, res) => {

    res.render("page/cart/cart");
};

/* ======================
   GET CART
====================== */

exports.getCart = (req, res) => {

    const user = req.session.customer;

    if (!user) {

        return res.json(
            req.session.cart || []
        );
    }

    cartService.getCartByCustomer(
        user.customer_id,
        (err, rows) => {

            if (err) {
                return res.json([]);
            }

            res.json(rows);
        }
    );
};

/* ======================
   UPDATE QTY
====================== */

exports.updateQuantity =
    (req, res) => {

        const {
            productId,
            quantity
        } = req.body;

        cartService.getProduct(
            productId,
            (err, rows) => {

                const product = rows[0];

                if (
                    quantity >
                    product.product_stock_quantity
                ) {

                    return res.json({
                        success: false,
                        message: "Vượt tồn kho"
                    });
                }

                cartService.updateQuantity(
                    productId,
                    quantity,
                    () => {

                        res.json({
                            success: true
                        });
                    }
                );
            }
        );
    };

/* ======================
   REMOVE
====================== */

exports.removeItem =
    (req, res) => {

        const { productId } =
            req.body;

        cartService.removeItem(
            productId,
            () => {

                res.json({
                    success: true
                });
            }
        );
    };
exports.addToCart = (req, res) => {

    const user = req.session.customer;
    const { productId } = req.body;

    if (!user) {
        return res.json({
            success: false,
            message: "Vui lòng đăng nhập"
        });
    }

    cartService.addToCart(
        user.customer_id,
        productId,
        (err, result) => {

            if (err) {
                console.log(err);
                return res.json({
                    success: false,
                    message: "Server error"
                });
            }

            return res.json({
                success: true
            });
        }
    );
};