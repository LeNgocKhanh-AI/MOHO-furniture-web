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

// Logic Modal Xem nội dung Feedback
const viewModal = document.getElementById("viewFeedbackModal");
const closeModalBtn = document.querySelector(".close-view-feedback");
const modalContentPlaceholder = document.getElementById("modalFeedbackMessage");

document.querySelectorAll(".btn-view-feedback").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
        e.preventDefault();

        const feedbackId = btn.dataset.id;
        const message = btn.dataset.message;
        const currentStatus = btn.dataset.status;

        // 1. Hiển thị tin nhắn lên modal nội dung
        modalContentPlaceholder.innerText = message;
        viewModal.style.display = "block";

        // 2. Nếu trạng thái đang là 'new', gọi API ngầm cập nhật thành 'read'
        if (currentStatus === "new") {
            try {
                const response = await fetch(
                    `/admin/dashboard/feedbacks/mark-as-read/${feedbackId}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                    },
                );
                const result = await response.json();

                if (result.success) {
                    // Cập nhật lại giao diện ngay tức thì không cần reload trang
                    btn.dataset.status = "read"; // Đổi thuộc tính data của nút

                    // Tìm hàng và cột chứa nhãn trạng thái để cập nhật chữ/màu sắc
                    const statusBadge = document.getElementById(
                        `status-badge-${feedbackId}`,
                    );
                    if (statusBadge) {
                        statusBadge.className = "status-tag tag-read";
                        statusBadge.innerText = "Đã xem";
                    }
                }
            } catch (err) {
                console.error("Lỗi khi cập nhật trạng thái đọc ngầm:", err);
            }
        }
    });
});

if (closeModalBtn && viewModal) {
    closeModalBtn.addEventListener(
        "click",
        () => (viewModal.style.display = "none"),
    );
}

window.addEventListener("click", (e) => {
    if (e.target === viewModal) viewModal.style.display = "none";
});
