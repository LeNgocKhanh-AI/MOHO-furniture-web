const cartService =
    require("../../services/shoppingcart");

const productService =
    require("../../services/product");
const orderService = require("../../services/order.service");
// exports.checkoutPage =
//     (req, res) => {

//         const user =
//             req.session.customer;

//         if (!user) {

//             return res.redirect("/login");
//         }

//         cartService.getCartByCustomer(
//             user.customer_id,
//             (err, cartItems) => {

//                 if (err) {

//                     console.log(err);

//                     return res.send(
//                         "Lỗi tải checkout"
//                     );
//                 }

//                 res.render(
//                     "page/checkout",
//                     {
//                         cartItems
//                     }
//                 );
//             }
//         );
//     };

// exports.buyNow =
//     (req, res) => {

//         const productId =
//             req.params.id;

//         productService.getProductDetail(
//             productId,
//             (err, result) => {

//                 if (err) {

//                     console.log(err);

//                     return res.send(
//                         "Lỗi sản phẩm"
//                     );
//                 }

//                 if (result.length === 0) {

//                     return res.send(
//                         "Không tìm thấy sản phẩm"
//                     );
//                 }

//                 const product =
//                     result[0];

//                 const cartItems = [
//                     {
//                         product_id:
//                             product.product_id,

//                         product_name:
//                             product.product_name,

//                         product_price:
//                             product.product_price,

//                         product_sale_price:
//                             product.product_sale_price,

//                         image_url:
//                             product.image_url,

//                         quantity: 1
//                     }
//                 ];

//                 res.render(
//                     "page/checkout",
//                     {
//                         cartItems,
//                         buyNow: true
//                     }
//                 );
//             }
//         );
//     };

// exports.submitOrder = (req, res) => {
//     const user = req.session.customer;
//     if (!user) return res.redirect("/login");

//     const checkoutData = req.body;

//     // 1. Cập nhật SĐT (nếu cần)
//     orderService.updateCustomerPhone(user.customer_id, checkoutData.phone, (err) => {
//         if (err) console.error("Lỗi cập nhật SĐT:", err);

//         // 2. Lưu hoặc Cập nhật địa chỉ vào bảng address
//         orderService.saveOrUpdateAddress(user.customer_id, checkoutData, (err) => {
//             if (err) {
//                 console.error("Lỗi lưu địa chỉ:", err);
//                 return res.send("Có lỗi xảy ra khi lưu địa chỉ.");
//             }

//             // 3. Lưu dữ liệu vào session để dùng ở bước sau
//             req.session.checkoutData = checkoutData;
//             return res.redirect("/payment/confirm");
//         });
//     });
// };

/* ======================
   CHECKOUT PAGE
====================== */
exports.checkoutPage = (req, res) => {
    const user = req.session.customer;

    // LOGIN — lấy từ DB
    if (user) {
        return cartService.getCartByCustomer(
            user.customer_id,
            (err, cartItems) => {
                if (err) return res.send("Lỗi tải checkout");
                res.render("page/checkout", { cartItems });
            }
        );
    }

    // GUEST — lấy từ session
    cartService.getGuestCart(
        req.session.cart || [],
        (cartItems) => {
            res.render("page/checkout", { cartItems });
        }
    );
};

/* ======================
   BUY NOW
====================== */
exports.buyNow = (req, res) => {
    const productId = req.params.id;
    const sizeId = req.query.sizeId;

    if (!sizeId) return res.send("Vui lòng chọn kích thước.");

    cartService.getProductWithSize(productId, sizeId, (err, rows) => {
        if (err || !rows || rows.length === 0)
            return res.send("Không tìm thấy sản phẩm.");

        const p = rows[0];
        const cartItems = [{
            product_id: p.product_id,
            product_name: p.product_name,
            product_price: p.product_price,
            product_sale_price: p.product_sale_price,
            image_url: p.image_url,
            size_id: p.size_id,
            size_name: p.size_name,
            quantity: 1
        }];

        // ← Lưu session trước, đợi save xong mới render
        req.session.buyNowCart = cartItems;
        req.session.save(() => {
            res.render("page/checkout", { cartItems, buyNow: true });
        });
    });
};

/* ======================
   SUBMIT ORDER
====================== */
/* ======================
   SUBMIT ORDER
====================== */
exports.submitOrder = (req, res) => {
    const user = req.session.customer;
    const checkoutData = req.body;

    const processOrder = (cartItems) => {
        if (!cartItems || cartItems.length === 0)
            return res.send("Giỏ hàng trống, không thể đặt hàng.");

        const saveAndRedirect = (customerId) => {
            req.session.checkoutData = { ...checkoutData, customerId };
            req.session.checkoutCart = JSON.parse(JSON.stringify(cartItems));
            req.session.checkoutCart = cartItems;
            res.redirect("/payment/confirm");
        };

        // LOGIN
        if (user) {
            return orderService.updateCustomerPhone(
                user.customer_id, checkoutData.phone,
                (err) => {
                    if (err) console.error("Lỗi cập nhật SĐT:", err);
                    orderService.saveOrUpdateAddress(user.customer_id, checkoutData, (err2) => {
                        if (err2) console.error("Lỗi lưu địa chỉ:", err2);
                        saveAndRedirect(user.customer_id);
                    });
                }
            );
        }

        // GUEST
        const fullAddress = [
            checkoutData.address,
            checkoutData.ward,
            checkoutData.district,
            checkoutData.province
        ].filter(Boolean).join(", ");

        orderService.createGuestCustomer(
            checkoutData.firstName,
            checkoutData.lastName,
            checkoutData.email,
            checkoutData.phone,
            fullAddress,
            (err, result) => {

                if (err) {
                    console.log(err);
                    return res.send(err.sqlMessage || err.message);
                }

                saveAndRedirect(result.insertId);
            }
        );
    };

    // ← Tách riên việc lấy cart ra ngoài processOrder
    // LOGIN
    if (user) {
        // Buy Now — dùng buyNowCart
        if (req.session.buyNowCart) {
            const cartItems = [...req.session.buyNowCart];
            req.session.buyNowCart = null;
            return processOrder(cartItems);
        }

        // Giỏ hàng thường — lấy từ DB
        return cartService.getCartByCustomer(
            user.customer_id,
            (err, cartItems) => {
                if (err) return res.send("Lỗi lấy giỏ hàng");
                processOrder(cartItems);
            }
        );
    }

    // GUEST
    if (req.session.buyNowCart) {
        const cartItems = [...req.session.buyNowCart];
        req.session.buyNowCart = null;
        return processOrder(cartItems);
    }

    cartService.getGuestCart(
        req.session.cart || [],
        (cartItems) => processOrder(cartItems)
    );
};