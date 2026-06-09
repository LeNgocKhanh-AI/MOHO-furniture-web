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

    // =====================
    // GUEST
    // =====================
    if (!user) {

        return cartService.getGuestCart(
            req.session.cart || [],
            (rows) => res.json(rows)
        );
    }

    // =====================
    // LOGIN
    // =====================
    cartService.getCartByCustomer(
        user.customer_id,
        (err, rows) => {
            if (err) return res.json([]);
            res.json(rows);
        }
    );
};
/* ======================
   UPDATE QTY
====================== */

exports.removeItem = (req, res) => {
    const user = req.session.customer;
    const productId = parseInt(req.body.productId);
    const sizeId = parseInt(req.body.sizeId);

    if (!user) {
        return cartService.removeGuestCart(
            req.session, productId, sizeId,
            () => res.json({ success: true })
        );
    }

    // truyền thêm sizeId
    cartService.removeItem(productId, sizeId, () => {
        res.json({ success: true });
    });
};

exports.updateQuantity = (req, res) => {
    const user = req.session.customer;
    const productId = parseInt(req.body.productId);
    const sizeId = parseInt(req.body.sizeId);
    const quantity = parseInt(req.body.quantity);

    if (!user) {
        return cartService.updateGuestCart(
            req.session, productId, sizeId, quantity,
            () => res.json({ success: true })
        );
    }

    cartService.getProduct(productId, (err, rows) => {
        if (err || !rows || rows.length === 0)
            return res.json({ success: false });

        const product = rows[0];
        if (quantity > parseInt(product.product_stock_quantity))
            return res.json({ success: false, message: "Vượt tồn kho" });

        // truyền thêm sizeId
        cartService.updateQuantity(productId, sizeId, quantity,
            () => res.json({ success: true })
        );
    });
};
/* ======================
   ADD TO CART
====================== */
exports.addToCart = (req, res) => {
    const user = req.session.customer;
    const productId = parseInt(req.body.productId);
    const sizeId = parseInt(req.body.sizeId);

    if (user) {
        return cartService.addToCart(user.customer_id, productId, sizeId, (err) => {
            if (err) return res.json({ success: false });
            res.json({ success: true });
        });
    }

    return cartService.addGuestCart(req.session, productId, sizeId,
        () => res.json({ success: true })
    );
};