let cart = JSON.parse(localStorage.getItem("cart")) || [];

/* =========================
   SAVE
========================= */
function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

/* =========================
   UPDATE COUNT
========================= */
function updateCartCount() {

    const count = cart.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    const el = document.querySelector(".cart-count");

    if (el) {
        el.innerText = count;
    }
}

/* =========================
   RENDER MINI CART
========================= */
function renderMiniCart() {

    const list = document.getElementById("miniCartList");
    const totalEl = document.getElementById("miniCartTotal");

    if (!list || !totalEl) return;

    list.innerHTML = "";

    let total = 0;

    cart.forEach(item => {

        total += item.price * item.quantity;

        list.innerHTML += `
      <div class="mini-cart-item">

        <img src="${item.image}" />

        <div style="flex:1">

          <div class="mini-cart-name">
            ${item.name.toUpperCase()}
          </div>

          <div class="mini-cart-price">

            <span class="price-current">
              ${item.price.toLocaleString()}đ
            </span>

            <span class="price-old">
              ${item.oldPrice.toLocaleString()}đ
            </span>

            <span class="qty-box">
              x${item.quantity}
            </span>

          </div>
        </div>

        <span 
          class="remove-btn"
          onclick="removeFromCart('${item.id}')"
        >
          ×
        </span>

      </div>
    `;
    });

    totalEl.innerHTML = `
    Tổng:
    <span style="color:red">
      ${total.toLocaleString()}đ
    </span>
  `;
}

/* =========================
   ADD TO CART
========================= */
function addToCart(product) {

    const existing = cart.find(
        i => i.id === product.id
    );

    if (existing) {

        existing.quantity += product.quantity;

    } else {

        cart.push(product);

    }

    saveCart();

    updateCartCount();

    renderMiniCart();
}

/* =========================
   REMOVE
========================= */
function removeFromCart(id) {

    cart = cart.filter(
        i => i.id !== id
    );

    saveCart();

    updateCartCount();

    renderMiniCart();
}

/* =========================
   TOGGLE MINI CART
========================= */
window.addEventListener("load", () => {

    updateCartCount();

    renderMiniCart();

    const cartBtn = document.querySelector(".cart");

    if (!cartBtn) return;

    cartBtn.addEventListener("click", (e) => {

        e.stopPropagation();

        const el = document.getElementById("miniCart");

        if (!el) return;

        el.style.display =
            el.style.display === "block"
                ? "none"
                : "block";
    });

});

/* =========================
   FLY EFFECT
========================= */
function flyToCart(imgElement) {

    const cartIcon =
        document.querySelector(".cart");

    if (!cartIcon) return;

    const img = imgElement.cloneNode(true);

    const rect =
        imgElement.getBoundingClientRect();

    const cartRect =
        cartIcon.getBoundingClientRect();

    img.classList.add("fly-img");

    document.body.appendChild(img);

    img.style.left = rect.left + "px";
    img.style.top = rect.top + "px";

    setTimeout(() => {

        img.style.left = cartRect.left + "px";
        img.style.top = cartRect.top + "px";
        img.style.opacity = "0";

    }, 10);

    setTimeout(() => {

        img.remove();

    }, 800);
}