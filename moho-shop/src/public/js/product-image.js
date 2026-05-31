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

// Modal Thêm ảnh
const imgModal = document.getElementById("imageModal");
const openImgBtn = document.getElementById("openImageModal");
const closeImgBtn = document.querySelector(".close-img-modal");

if (openImgBtn && imgModal) {
    openImgBtn.addEventListener(
        "click",
        () => (imgModal.style.display = "block"),
    );
    closeImgBtn.addEventListener(
        "click",
        () => (imgModal.style.display = "none"),
    );
}

// Modal Sửa ảnh
const editImgModal = document.getElementById("editImageModal");
const editImgForm = document.getElementById("editImageForm");
const closeEditImgBtn = document.querySelector(".close-edit-img");

document.querySelectorAll(".edit-img-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
        e.preventDefault();
        editImgModal.style.display = "block";

        // Đổ dữ liệu từ data-attributes vào form sửa
        document.getElementById("edit_img_id").value = btn.dataset.id;
        document.getElementById("edit_product_id").value = btn.dataset.product;
        document.getElementById("edit_image_url").value = btn.dataset.url;
        document.getElementById("edit_image_type").value = btn.dataset.type;
        document.getElementById("edit_display_order").value = btn.dataset.order;

        // Cài đặt lại attribute action cho form
        editImgForm.action = `/admin/dashboard/product-images/edit/${btn.dataset.id}`;
    });
});

if (closeEditImgBtn && editImgModal) {
    closeEditImgBtn.addEventListener(
        "click",
        () => (editImgModal.style.display = "none"),
    );
}

// Đóng khi click ngoài vùng modal
window.addEventListener("click", (e) => {
    if (e.target === imgModal) imgModal.style.display = "none";
    if (e.target === editImgModal) editImgModal.style.display = "none";
});
