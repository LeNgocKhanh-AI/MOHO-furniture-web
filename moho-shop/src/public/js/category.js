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
