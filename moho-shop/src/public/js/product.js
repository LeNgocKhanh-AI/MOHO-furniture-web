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

const modal = document.getElementById("productModal");

const openBtn = document.getElementById("openProductModal");

const closeBtn = document.querySelector(".close-modal");

openBtn.addEventListener("click", () => {
    modal.style.display = "block";
});

closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
});

window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
});

const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");

if (editModal && editForm) {
    document.querySelectorAll(".edit-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();

            editForm.action = `/admin/dashboard/product/edit/${btn.dataset.id}`;

            document.getElementById("edit_id").value = btn.dataset.id;
            document.getElementById("edit_name").value = btn.dataset.name;
            document.getElementById("edit_category").value = btn.dataset.category;
            document.getElementById("edit_price").value = btn.dataset.price;
            document.getElementById("edit_sale").value = btn.dataset.sale;
            document.getElementById("edit_sku").value = btn.dataset.sku;
            document.getElementById("edit_stock").value = btn.dataset.stock;
            document.getElementById("edit_featured").checked = btn.dataset.featured == 1;

            if (typeof editEditor !== 'undefined' && editEditor) {
                editEditor.setData(btn.dataset.desc || '');
            } else {
                document.getElementById("edit_description").value = btn.dataset.desc || '';
            }

            editModal.style.display = "block";
        });
    });

    document.querySelector(".close-edit").addEventListener("click", () => {
        editModal.style.display = "none";
    });

    window.addEventListener("click", (e) => {
        if (e.target === editModal) editModal.style.display = "none";
    });
}

// Logic điều khiển Modal xem chi tiết sản phẩm mới bổ sung
const viewDetailModal = document.getElementById("viewDetailModal");
const closeViewBtns = document.querySelectorAll(".close-view-detail");

document.querySelectorAll(".btn-view-detail").forEach((btn) => {
    btn.addEventListener("click", () => {
        // Trích xuất dữ liệu từ data attribute gắn trên nút bấm
        const name = btn.dataset.name;
        const sku = btn.dataset.sku;
        const category = btn.dataset.category;
        const price = parseFloat(btn.dataset.price || 0);
        const sale = parseFloat(btn.dataset.sale || 0);
        const stock = btn.dataset.stock;
        const desc = btn.dataset.desc;

        // Đổ dữ liệu vào các thẻ hiển thị trên Modal
        document.getElementById("v_name").innerText = name;
        document.getElementById("v_sku").innerText = sku || "Chưa thiết lập";
        document.getElementById("v_category").innerText = category;
        document.getElementById("v_stock").innerText = stock;
        document.getElementById("v_desc").innerText =
            desc || "Không có mô tả sản phẩm.";
        document.getElementById("v_price").innerText =
            price.toLocaleString("vi-VN") + " đ";
        document.getElementById("v_sale").innerText =
            sale.toLocaleString("vi-VN") + " đ";

        // Mở modal hiển thị lên màn hình
        viewDetailModal.style.display = "block";
    });
});

// Đóng modal khi bấm dấu x hoặc nút Đóng
closeViewBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        viewDetailModal.style.display = "none";
    });
});

// Đóng modal khi bấm trượt ra ngoài vùng chứa
window.addEventListener("click", (e) => {
    if (e.target === viewDetailModal) {
        viewDetailModal.style.display = "none";
    }
});

const searchInput = document.getElementById("searchProduct");
const cards = document.querySelectorAll(".product-card");
const notFound = document.getElementById("notFound");

searchInput.addEventListener("input", function () {

    const keyword = this.value.trim().toLowerCase();
    let count = 0;

    cards.forEach(card => {
        const id = card.dataset.id;
        const name = card.dataset.name;
        const sku = card.dataset.sku;

        if (
            id.includes(keyword) ||
            name.includes(keyword) ||
            sku.includes(keyword)
        ) {
            card.style.display = "block";
            count++;
        } else {
            card.style.display = "none";
        }
    });

    notFound.style.display = count === 0 ? "block" : "none";
});
