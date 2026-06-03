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

// ==========================================
// MODAL THÊM DANH MỤC (Add Category Modal)
// ==========================================
const catModal = document.getElementById("categoryModal");
const catOpenBtn = document.getElementById("openCategoryModal");
const catCloseBtn = document.querySelector(".close-cat-modal");

if (catModal && catOpenBtn) {
    catOpenBtn.addEventListener("click", () => {
        catModal.style.display = "block";
    });

    if (catCloseBtn) {
        catCloseBtn.addEventListener("click", () => {
            catModal.style.display = "none";
        });
    }

    window.addEventListener("click", (e) => {
        if (e.target === catModal) {
            catModal.style.display = "none";
        }
    });
}

// ==========================================
// MODAL SỬA DANH MỤC (Edit Category Modal)
// ==========================================
const editCatModal = document.getElementById("editCategoryModal");
const editCatForm = document.getElementById("editCategoryForm");

if (editCatModal && editCatForm) {
    document.querySelectorAll(".edit-cat-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault(); // Ngăn chặn load lại trang hoặc nhảy thẻ a

            editCatModal.style.display = "block";

            // Đổ dữ liệu từ data-attribute của nút Sửa vào các ô input trong form
            document.getElementById("edit_cat_id").value = btn.dataset.id;
            document.getElementById("edit_cat_name").value = btn.dataset.name;
            document.getElementById("edit_cat_desc").value = btn.dataset.desc;

            // Cập nhật lại thuộc tính action của form theo đúng ID danh mục cần sửa
            editCatForm.action = `/admin/dashboard/category/edit/${btn.dataset.id}`;
        });
    });

    const closeEditCatBtn = document.querySelector(".close-edit-cat");
    if (closeEditCatBtn) {
        closeEditCatBtn.addEventListener("click", () => {
            editCatModal.style.display = "none";
        });
    }

    window.addEventListener("click", (e) => {
        if (e.target === editCatModal) {
            editCatModal.style.display = "none";
        }
    });
}
