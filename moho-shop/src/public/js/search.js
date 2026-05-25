const input = document.getElementById("searchInput");
const dropdown = document.getElementById("searchDropdown");
const button = document.querySelector(".search-box button");

let timer;

/* =========================
   DROPDOWN GỢI Ý
========================= */
input.addEventListener("input", function () {
  clearTimeout(timer);

  const keyword = this.value.trim();

  if (!keyword) {
    dropdown.style.display = "none";
    return;
  }

  timer = setTimeout(async () => {
    try {
      const res = await fetch(
        `/goi-y-tim-kiem?keyword=${encodeURIComponent(keyword)}`
      );

      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        dropdown.style.display = "block";
        dropdown.innerHTML = `
          <div style="padding:10px;text-align:center;color:#999">
            Không tìm thấy sản phẩm
          </div>`;
        return;
      }

      dropdown.style.display = "block";

      dropdown.innerHTML = data.map(p => `
        <a href="/product/${p.product_id}" class="search-item">
          <img src="${p.image_url || '/images/default.png'}" />

          <div>
            <div class="search-name">${p.product_name}</div>

            <div class="search-price">
              <span class="sale-price">
                ${Number(p.product_sale_price || 0).toLocaleString()}đ
              </span>

              <span class="old-price">
                ${Number(p.product_price || 0).toLocaleString()}đ
              </span>
            </div>
          </div>
        </a>
      `).join("");

    } catch (err) {
      console.log(err);
    }
  }, 300);
});


/* =========================
   CLICK NÚT SEARCH → TRANG SEARCH
========================= */
button.addEventListener("click", function () {
  const keyword = input.value.trim();

  if (!keyword) return;

  window.location.href = `/search?q=${encodeURIComponent(keyword)}`;
});


/* =========================
   ENTER → SEARCH PAGE
========================= */
input.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();

    const keyword = input.value.trim();
    if (!keyword) return;

    window.location.href = `/search?q=${encodeURIComponent(keyword)}`;
  }
});