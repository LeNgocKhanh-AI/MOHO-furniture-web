// DROPDOWN SIDEBAR

const dropdownMenu = document.querySelector(".dropdown-menu");

const dropdownToggle = document.querySelector(".dropdown-toggle");

dropdownToggle.addEventListener("click", () => {
    dropdownMenu.classList.toggle("active");
});

// DROPDOWN FEEDBACK

const feedbackMenu = document.querySelector(".dropdown-feedback");

const feedbackToggle = document.querySelector(".dropdown-feedback-toggle");

feedbackToggle.addEventListener("click", () => {
    feedbackMenu.classList.toggle("active");
});

// DROPDOWN ORDERS

const ordersMenu = document.querySelector(".dropdown-orders");

const ordersToggle = document.querySelector(".dropdown-orders-toggle");

ordersToggle.addEventListener("click", () => {
    ordersMenu.classList.toggle("active");
});

// =========================
// Dropdown Product
// =========================

const productDropdown = document.querySelector(".dropdown-product");
const productToggle = document.querySelector(".dropdown-product-toggle");

if (productToggle) {
    productToggle.addEventListener("click", () => {
        productDropdown.classList.toggle("active");
    });
}
