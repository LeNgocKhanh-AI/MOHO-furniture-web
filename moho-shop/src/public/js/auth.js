document.addEventListener("DOMContentLoaded", () => {

  /* =========================
      ELEMENTS
  ========================= */

  const account = document.querySelector(".account");
  const loginPopup = document.getElementById("loginPopup");
  const userDropdown = document.getElementById("userDropdown");

  const cart = document.querySelector(".cart");
  const miniCart = document.getElementById("miniCart");

  const searchInput = document.getElementById("searchInput");
  const searchDropdown = document.getElementById("searchDropdown");

  const isLoggedIn = !!userDropdown;

  /* =========================
      ACCOUNT TOGGLE
  ========================= */

  if (account) {
    account.addEventListener("click", (e) => {
      e.stopPropagation();

      if (e.target.closest(".login-popup")) return;

      if (isLoggedIn && userDropdown) {
        userDropdown.classList.toggle("active");
        loginPopup?.classList.remove("active");
      } else {
        loginPopup?.classList.toggle("active");
        userDropdown?.classList.remove("active");
      }
    });
  }

  /* =========================
      CLICK OUTSIDE CLOSE ALL
  ========================= */

  document.addEventListener("click", (e) => {
    if (!account?.contains(e.target)) {
      loginPopup?.classList.remove("active");
      userDropdown?.classList.remove("active");
    }

    if (!cart?.contains(e.target)) {
      if (miniCart) miniCart.style.display = "none";
    }
  });

  /* =========================
      LOGIN FORM (XỬ LÝ Ở NGUYÊN TRANG CŨ)
  ========================= */

  const allLoginForms = document.querySelectorAll("#loginForm");

  allLoginForms.forEach((form) => {
    form.addEventListener("submit", async (e) => {
      // BẢO VỆ: Nếu người dùng click trúng nút Google nằm trong form, cho phép nó chạy tự nhiên, không chặn!
      if (e.submitter && e.submitter.closest('a[href*="auth/google"]')) {
        return;
      }

      e.preventDefault(); // Chặn luồng load lại trang mặc định của form

      const data = {
        email: form.email.value,
        password: form.password.value,
      };

      try {
        const res = await fetch("/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await res.json();

        if (result.success) {
          // Ưu tiên 1: Nếu backend chỉ định link nhảy (BẮT BUỘC cho ADMIN sang /admin/dashboard)
          if (result.role === "admin" && result.redirect) {
            window.location.href = result.redirect;
            return;
          }

          // Ưu tiên 2: Xử lý quay lại trang cũ đối với khách hàng thường (Customer)
          if (window.location.pathname === "/login") {
            // Lấy URL trang trước đó mà người dùng đứng trước khi nhấn vào trang login lớn
            const previousPage = document.referrer;

            // Nếu có trang trước và trang đó không phải là chính trang login/register, đẩy họ về đó
            if (previousPage && !previousPage.includes("/login") && !previousPage.includes("/register")) {
              window.location.href = previousPage;
            } else {
              // Nếu khách gõ trực tiếp đường dẫn /login trên thanh địa chỉ, đăng nhập xong đưa về trang chủ
              window.location.href = "/";
            }
          } else {
            // Nếu khách đăng nhập bằng Popup nhỏ ngay trên Header tại trang bất kỳ, chỉ cần reload để nhận trạng thái
            location.reload();
          }
        } else {
          // Nếu thất bại hiển thị thông báo lỗi trực quan
          alert(result.message || "Đăng nhập thất bại! Vui lòng kiểm tra lại tài khoản.");
        }

      } catch (err) {
        console.error(err);
        alert("Lỗi kết nối Server");
      }
    });
  });

  /* =========================
      MINI CART TOGGLE
  ========================= */

  if (cart && miniCart) {
    cart.addEventListener("click", (e) => {
      e.stopPropagation();

      miniCart.style.display =
        miniCart.style.display === "block" ? "none" : "block";
    });
  }

  /* =========================
      SEARCH DROPDOWN
  ========================= */

  if (searchInput && searchDropdown) {
    searchInput.addEventListener("focus", () => {
      searchDropdown.style.display = "block";
    });

    searchInput.addEventListener("blur", () => {
      setTimeout(() => {
        searchDropdown.style.display = "none";
      }, 150);
    });
  }

});