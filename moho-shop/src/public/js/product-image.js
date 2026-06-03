// Gom toàn bộ các toggle menu lại để xử lý chung một cách thông minh
const allDropdownToggles = document.querySelectorAll(
    [
        ".dropdown-toggle",
        ".dropdown-feedback-toggle",
        ".dropdown-orders-toggle",
        ".dropdown-product-toggle",
    ].join(","),
);

allDropdownToggles.forEach((toggle) => {
    toggle.addEventListener("click", function () {
        // Tìm phần tử cha trực tiếp (thẻ <li>) của nút vừa click và bật/tắt class 'active'
        const parentMenu = this.parentElement;
        if (parentMenu) {
            parentMenu.classList.toggle("active");
        }
    });
});

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
