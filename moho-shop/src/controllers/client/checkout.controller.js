const cartService =
    require("../../services/shoppingcart");

const productService =
    require("../../services/product");
const orderService = require("../../services/order.service");
exports.checkoutPage =
    (req, res) => {

        const user =
            req.session.customer;

        if (!user) {

            return res.redirect("/login");
        }

        cartService.getCartByCustomer(
            user.customer_id,
            (err, cartItems) => {

                if (err) {

                    console.log(err);

                    return res.send(
                        "Lỗi tải checkout"
                    );
                }

                res.render(
                    "page/checkout",
                    {
                        cartItems
                    }
                );
            }
        );
    };

exports.buyNow =
    (req, res) => {

        const productId =
            req.params.id;

        productService.getProductDetail(
            productId,
            (err, result) => {

                if (err) {

                    console.log(err);

                    return res.send(
                        "Lỗi sản phẩm"
                    );
                }

                if (result.length === 0) {

                    return res.send(
                        "Không tìm thấy sản phẩm"
                    );
                }

                const product =
                    result[0];

                const cartItems = [
                    {
                        product_id:
                            product.product_id,

                        product_name:
                            product.product_name,

                        product_price:
                            product.product_price,

                        product_sale_price:
                            product.product_sale_price,

                        image_url:
                            product.image_url,

                        quantity: 1
                    }
                ];

                res.render(
                    "page/checkout",
                    {
                        cartItems,
                        buyNow: true
                    }
                );
            }
        );
    };

exports.submitOrder = (req, res) => {
    const user = req.session.customer;
    if (!user) return res.redirect("/login");

    const checkoutData = req.body; // Lấy dữ liệu từ form (fullName, phone,...)

    // Gọi service cập nhật số điện thoại vào bảng customer
    orderService.updateCustomerPhone(user.customer_id, checkoutData.phone, (err) => {
        if (err) console.error("Lỗi cập nhật SĐT:", err);

        // Lưu dữ liệu vào session để dùng ở trang confirm
        req.session.checkoutData = checkoutData;
        return res.redirect("/payment/confirm");
    });
};