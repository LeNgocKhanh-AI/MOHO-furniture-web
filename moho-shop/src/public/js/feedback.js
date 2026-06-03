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
