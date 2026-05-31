document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     ELEMENTS
  ========================= */

  const account = document.querySelector(".account");
  const loginPopup = document.getElementById("loginPopup");
  const loginForm = document.getElementById("loginForm");
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
     LOGIN FORM
  ========================= */

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const data = {
        email: loginForm.email.value,
        password: loginForm.password.value,
      };

      try {
        const res = await fetch("/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await res.json();

        if (result.success) {

          if (result.redirect) {
            window.location.href = result.redirect;
            return;
          }

          location.reload();
        }

      } catch (err) {
        console.error(err);
        alert("Server error");
      }
    });
  }

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