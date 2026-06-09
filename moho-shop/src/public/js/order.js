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
// XỬ LÝ LOGIC POPUP SẢN PHẨM ĐƠN HÀNG
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const orderItemsModal = document.getElementById("orderItemsModal");
    const productDetailModal = document.getElementById("productDetailModal");
    const popupGridContainer = document.getElementById("popupGridContainer");
    const popupPaginationContainer = document.getElementById(
        "popupPaginationContainer",
    );

    let orderProductsArray = []; // Nơi chứa danh sách sản phẩm từ API
    let currentPopupPage = 1; // Trang hiện tại của popup
    const itemsPerPage = 3; // Hiển thị 3 sản phẩm trên 1 trang

    // 1. Khi nhấn nút "Xem chi tiết các sản phẩm" trên bảng đơn hàng chính
    document.querySelectorAll(".btn-open-order-modal").forEach((button) => {
        button.addEventListener("click", async () => {
            const orderId = button.dataset.id;
            document.getElementById("popupOrderIdText").innerText = "#ORD" + orderId;
            popupGridContainer.innerHTML =
                "<p style='grid-column: span 3; text-align:center;'>Đang tải dữ liệu đơn hàng...</p>";
            orderItemsModal.style.display = "block";

            try {
                // 🔥 Đã sửa đường dẫn chuẩn đồng bộ theo cấu trúc Router mới trên cổng 4000 của bạn
                const response = await fetch(
                    `/admin/dashboard/orders/api/items?order_id=${orderId}`,
                );
                orderProductsArray = await response.json();

                currentPopupPage = 1;
                renderPopupGrid();
            } catch (error) {
                console.error("Lỗi chi tiết tại Frontend:", error); // 🔥 Đã sửa chữ pconsole thành console chuẩn
                popupGridContainer.innerHTML =
                    "<p style='color:red; grid-column: span 3; text-align:center;'>Lỗi không tải được sản phẩm.</p>";
            }
        });
    });

    // 2. Hàm phân trang và render giao diện dạng lưới ô vuông
    function renderPopupGrid() {
        if (orderProductsArray.length === 0) {
            popupGridContainer.innerHTML =
                "<p style='grid-column: span 3; text-align:center;'>Đơn hàng này không có sản phẩm.</p>";
            popupPaginationContainer.innerHTML = "";
            return;
        }

        const start = (currentPopupPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const displayItems = orderProductsArray.slice(start, end);

        // Tiến hành lặp mảng tạo cấu trúc HTML dạng ô lưới
        popupGridContainer.innerHTML = displayItems
            .map((prod) => {
                const imgPath = prod.product_image
                    ? prod.product_image
                    : "https://placehold.co/300x200?text=Moho+Shop";
                const priceFormatted =
                    Number(prod.unit_price).toLocaleString("vi-VN") + " đ";

                // 🔥 Xử lý thẻ trạng thái đè góc ảnh dựa theo logic đảo ngược (0: Đăng bán, 1: Ẩn)
                let statusBadgeHtml = "";
                if (prod.is_featured == 0) {
                    statusBadgeHtml = `<span style="position: absolute; top: 8px; left: 8px; background: rgba(46, 204, 113, 0.95); color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; z-index: 10;"><i class="fa-solid fa-eye"></i> Đang đăng bán</span>`;
                } else {
                    statusBadgeHtml = `<span style="position: absolute; top: 8px; left: 8px; background: rgba(231, 76, 60, 0.95); color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; z-index: 10;"><i class="fa-solid fa-eye-slash"></i> Đang ẩn</span>`;
                }

                return `
        <div class="popup-product-card" style="position: relative;">
          ${statusBadgeHtml} <img src="${imgPath}" class="popup-product-img" alt="${prod.product_name}">
          <div class="popup-product-info">
            <h4 class="popup-product-name" title="${prod.product_name}">${prod.product_name}</h4>
            <div>
              <div class="popup-product-price">${priceFormatted}</div>
              <div style="font-size:11px; color:#64748b; margin-top:2px;">Số lượng đặt: x${prod.quantity}</div>
            </div>
          </div>
          <button type="button" class="btn-popup-detail" 
                  data-name="${prod.product_name}" 
                  data-sku="${prod.product_sku || "Không có"}" 
                  data-desc="${prod.product_description || "Không có mô tả sản phẩm."}">
            <i class="fa-regular fa-eye"></i> Xem chi tiết
          </button>
        </div>
      `;
            })
            .join("");

        const totalPopupPages = Math.ceil(orderProductsArray.length / itemsPerPage);
        buildPopupPaginationControls(totalPopupPages);

        // Kích hoạt nút xem chi tiết sâu hơn của sản phẩm (Bật Modal nhỏ tầng 2)
        document.querySelectorAll(".btn-popup-detail").forEach((detailBtn) => {
            detailBtn.addEventListener("click", () => {
                document.getElementById("dt_name").innerText = detailBtn.dataset.name;
                document.getElementById("dt_sku").innerText = detailBtn.dataset.sku;
                document.getElementById("dt_desc").innerText = detailBtn.dataset.desc;
                productDetailModal.style.display = "block";
            });
        });
    }

    // 3. Hàm xây dựng thanh điều hướng trang tiến lùi nằm dưới đáy Popup
    function buildPopupPaginationControls(totalPages) {
        if (totalPages <= 1) {
            popupPaginationContainer.innerHTML = "";
            return;
        }

        popupPaginationContainer.innerHTML = `
      <button type="button" class="btn-mod-page" id="popupPrevBtn" ${currentPopupPage === 1 ? "disabled" : ""}>← Trước</button>
      <span id="modalPageInfo">Trang ${currentPopupPage} / ${totalPages}</span>
      <button type="button" class="btn-mod-page" id="popupNextBtn" ${currentPopupPage === totalPages ? "disabled" : ""}>Sau →</button>
    `;

        document.getElementById("popupPrevBtn").addEventListener("click", () => {
            if (currentPopupPage > 1) {
                currentPopupPage--;
                renderPopupGrid();
            }
        });

        document.getElementById("popupNextBtn").addEventListener("click", () => {
            if (currentPopupPage < totalPages) {
                currentPopupPage++;
                renderPopupGrid();
            }
        });
    }

    // 4. Các sự kiện xử lý tắt đóng các tầng Form Modal
    document.querySelector(".close-items-modal").addEventListener("click", () => {
        orderItemsModal.style.display = "none";
    });

    document
        .querySelector(".close-detail-modal")
        .addEventListener("click", () => {
            productDetailModal.style.display = "none";
        });

    window.addEventListener("click", (e) => {
        if (e.target === orderItemsModal) orderItemsModal.style.display = "none";
        if (e.target === productDetailModal)
            productDetailModal.style.display = "none";
    });
});
// ==========================================
// XỬ LÝ LOGIC XÓA ĐƠN HÀNG (AJAX)
// ==========================================
document.querySelectorAll(".btn-delete-order").forEach((button) => {
    button.addEventListener("click", async () => {
        const orderId = button.dataset.id;

        // Hiện hộp thoại xác nhận trước khi hủy/xóa
        const confirmDelete = confirm(
            `Bạn có chắc chắn muốn xóa vĩnh viễn đơn hàng #ORD${orderId} cùng toàn bộ sản phẩm bên trong không? Tác vụ này không thể hoàn tác!`,
        );

        if (confirmDelete) {
            try {
                // Gọi API Delete ngầm
                const response = await fetch(`/admin/dashboard/api/delete/${orderId}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                const result = await response.json();

                if (result.success) {
                    alert(result.message);

                    // Xóa mượt hàng vừa chọn trên giao diện mà không cần reload trang
                    const orderRow = document.getElementById(`order-row-${orderId}`);
                    if (orderRow) {
                        orderRow.style.transition = "all 0.4s ease";
                        orderRow.style.opacity = "0";
                        setTimeout(() => {
                            orderRow.remove();
                            // Nếu muốn đồng bộ lại phân trang hoặc tải lại trang bạn có thể dùng: location.reload();
                        }, 400);
                    }
                } else {
                    alert("Thất bại: " + result.error);
                }
            } catch (error) {
                console.error("Lỗi khi gửi yêu cầu xóa đơn hàng:", error);
                alert("Có lỗi xảy ra, không thể kết nối tới máy chủ.");
            }
        }
    });
});

