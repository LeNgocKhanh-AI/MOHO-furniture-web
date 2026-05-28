const account = document.querySelector(".account");
const popup = document.getElementById("loginPopup");

/* ===== TOGGLE LOGIN POPUP ===== */

if (account && popup) {
  account.addEventListener("click", (e) => {
    e.stopPropagation(); // tránh click lan ra ngoài

    popup.style.display =
      popup.style.display === "block"
        ? "none"
        : "block";
  });
}

/* ===== CLICK OUTSIDE TO CLOSE ===== */

document.addEventListener("click", () => {
  if (popup) {
    popup.style.display = "none";
  }
});

/* ===== LOGIN ===== */

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(loginForm);

    const data = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    const res = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (result.success) {
      location.reload(); // reload để header update session
    } else {
      alert(result.message);
    }
  });
}