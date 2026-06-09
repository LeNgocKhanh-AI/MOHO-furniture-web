let cart = [];

/* =========================
   LOAD CART
========================= */
async function loadCart() {
    try {
        const res = await fetch("/cart/item");
        cart = await res.json();

        updateCartCount();
        renderMiniCart();
        renderCartPage();

    } catch (err) {
        console.error(err);
    }
}

/* =========================
   UPDATE COUNT
========================= */
function updateCartCount() {

    const count = cart.reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0
    );

    const el = document.querySelector(".cart-count");

    if (el) el.innerText = count;
}

/* =========================
   MINI CART
========================= */
function renderMiniCart() {

    const list = document.getElementById("miniCartList");
    const totalEl = document.getElementById("miniCartTotal");

    if (!list || !totalEl) return;

    list.innerHTML = "";

    let total = 0;

    cart.forEach(item => {

        const qty = Number(item.quantity || 0);
        const salePrice = Number(item.product_sale_price || item.product_price || 0);
        const oldPrice = Number(item.product_price || 0);
        const stock = Number(item.product_stock_quantity || 0);
        const outOfStock = stock <= 0;

        if (!outOfStock) {
            total += salePrice * qty;
        }

        list.innerHTML += `
        <div class="mini-cart-item ${outOfStock ? "out-stock" : ""}">

            <img src="${item.image_url || "/images/no-image.jpg"}">

            <div style="flex:1;">

                <div class="mini-cart-name">
                    ${item.product_name}
                </div>

                <div class="mini-cart-price">

                    <span class="price-current">
                        ${salePrice.toLocaleString()}đ
                    </span>

                    <span class="old-price">
                        (${oldPrice.toLocaleString()}đ)
                    </span>

                    <div style="color:#999;font-size:13px;margin-top:3px;">
                        ${item.size_name || ""}
                    </div>

                    <span class="qty-box">x${qty}</span>

                    ${outOfStock
                ? `<div style="color:red;font-weight:bold;margin-top:5px;">HẾT HÀNG</div>`
                : ""
            }

                </div>

            </div>

            <span
                class="remove-btn"
                onclick="removeFromCart(${item.product_id}, ${item.size_id})"
            >
                ×
            </span>

        </div>
        `;
    });

    totalEl.innerHTML = `
        Tổng:
        <span style="color:red;font-weight:bold">
            ${total.toLocaleString()}đ
        </span>
    `;
}

/* =========================
   ADD TO CART
========================= */
async function addToCart(productId, sizeId) {

    try {

        const res = await fetch("/cart/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, sizeId })
        });

        const data = await res.json();

        if (!data.success) {
            alert(data.message);
            return;
        }

        await loadCart();

        const miniCart = document.getElementById("miniCart");
        if (miniCart) miniCart.classList.add("show");

    } catch (err) {
        console.log(err);
    }
}

/* =========================
   REMOVE
========================= */
async function removeFromCart(productId, sizeId) {

    try {

        const res = await fetch("/cart/remove", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, sizeId })
        });

        const data = await res.json();

        if (data.success) await loadCart();

    } catch (err) {
        console.log(err);
    }
}

/* =========================
   UPDATE QTY
========================= */
async function updateQuantity(productId, sizeId, quantity) {

    quantity = Number(quantity);

    if (isNaN(quantity) || quantity <= 0) {
        await removeFromCart(productId, sizeId);
        return;
    }

    try {

        const res = await fetch("/cart/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, sizeId, quantity })
        });

        const data = await res.json();

        if (data.success) await loadCart();

    } catch (err) {
        console.log(err);
    }
}

/* =========================
   CART PAGE
========================= */
function renderCartPage() {

    const container = document.getElementById("cartItems");
    const totalBox = document.getElementById("cartTotal");
    const countText = document.getElementById("cartCountText");

    if (!container || !totalBox) return;

    container.innerHTML = "";

    let total = 0;

    cart.forEach(item => {

        const qty = Number(item.quantity || 0);
        const price = Number(item.product_sale_price || item.product_price || 0);
        const oldPrice = Number(item.product_price || 0);
        const subtotal = price * qty;

        total += subtotal;

        container.innerHTML += `
        <div class="cart-item">

            <button
                class="remove-btn"
                onclick="removeFromCart(${item.product_id}, ${item.size_id})"
            >
                ×
            </button>

            <img src="${item.image_url || "/images/no-image.jpg"}">

            <div class="cart-info">

                <h3 class="product-name">
                    ${item.product_name}
                </h3>

                <div class="cart-price">
                    <span class="sale-price">
                        ${price.toLocaleString()}đ
                    </span>
                    <span class="old-price">
                        ${oldPrice > price ? `(${oldPrice.toLocaleString()}đ)` : ""}
                    </span>
                </div>

                <div class="cart-meta">

                    <div class="cart-size">
                        Kích thước: ${item.size_name || ""}
                    </div>

                    <div class="qty-box">
                        <button onclick="updateQuantity(${item.product_id}, ${item.size_id}, ${qty - 1})">-</button>
                        <span class="qty-number">${qty}</span>
                        <button onclick="updateQuantity(${item.product_id}, ${item.size_id}, ${qty + 1})">+</button>
                    </div>

                </div>

            </div>

            <div class="cart-right-box">
                <div class="subtotal">
                    ${subtotal.toLocaleString()}đ
                </div>
            </div>

        </div>
        `;
    });

    if (countText) {
        countText.innerText = `Có ${cart.length} sản phẩm trong giỏ hàng`;
    }

    totalBox.innerHTML = `
        Tổng tiền:
        <b>${total.toLocaleString()}đ</b>
    `;
}

/* =========================
   GO CHECKOUT
========================= */
function goCheckout() {
    window.location.href = "/checkout";
}

/* =========================
   FLY EFFECT
========================= */
function flyToCart(imgElement) {

    const cartIcon = document.querySelector(".cart");
    if (!cartIcon) return;

    const img = imgElement.cloneNode(true);
    const rect = imgElement.getBoundingClientRect();
    const cartRect = cartIcon.getBoundingClientRect();

    img.classList.add("fly-img");
    document.body.appendChild(img);

    img.style.position = "fixed";
    img.style.left = rect.left + "px";
    img.style.top = rect.top + "px";

    setTimeout(() => {
        img.style.left = cartRect.left + "px";
        img.style.top = cartRect.top + "px";
        img.style.opacity = "0";
    }, 10);

    setTimeout(() => img.remove(), 800);
}

/* =========================
   LOAD INIT
========================= */
document.addEventListener("DOMContentLoaded", loadCart);

/* =========================
   MINI CART CHECKOUT
========================= */
document.addEventListener("DOMContentLoaded", () => {

    const btn = document.querySelector('.mini-cart-footer a[href="/cart/checkout"]');

    if (btn) {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            goCheckout();
        });
    }
});