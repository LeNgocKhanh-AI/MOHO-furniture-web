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

// ... Giữ nguyên toàn bộ code xử lý Dropdown Sidebar cũ của bạn ...

document.addEventListener("DOMContentLoaded", () => {
    const orderItemsModal = document.getElementById("orderItemsModal");
    const productDetailModal = document.getElementById("productDetailModal");
    const popupGridContainer = document.getElementById("popupGridContainer");
    const popupPaginationContainer = document.getElementById(
        "popupPaginationContainer",
    );

    let orderProductsArray = []; // Nơi chứa tạm danh sách sản phẩm lấy từ API
    let currentPopupPage = 1; // Trang hiện tại của popup
    const itemsPerPage = 3; // Định mức đúng 3 sản phẩm trên một trang (để xếp vừa 1 dòng)

    // 1. Khi nhấn nút "Xem chi tiết các sản phẩm" trên bảng đơn hàng chính
    document.querySelectorAll(".btn-open-order-modal").forEach((button) => {
        button.addEventListener("click", async () => {
            const orderId = button.dataset.id;
            document.getElementById("popupOrderIdText").innerText = "#ORD" + orderId;
            popupGridContainer.innerHTML =
                "<p style='grid-column: span 3; text-align:center;'>Đang tải dữ liệu món ăn...</p>";
            orderItemsModal.style.display = "block";

            try {
                // Gọi AJAX ngầm lên API backend để lấy danh sách sản phẩm
                const response = await fetch(
                    `/admin/dashboard/orders/api/items?order_id=${orderId}`,
                );
                orderProductsArray = await response.json();

                // Luôn đặt về trang 1 khi mở đơn hàng mới và tiến hành render vẽ giao diện
                currentPopupPage = 1;
                renderPopupGrid();
            } catch (error) {
                pconsole.error("Lỗi chi tiết tại Frontend:", error); // <-- Thêm dòng này để xem lỗi gốc là gì
                popupGridContainer.innerHTML =
                    "<p style='color:red; grid-column: span 3; text-align:center;'>Lỗi không tải được sản phẩm.</p>";
            }
        });
    });

    // 2. Hàm cắt mảng dữ liệu để vẽ đúng 3 sản phẩm lên 1 dòng tương ứng với số trang
    function renderPopupGrid() {
        if (orderProductsArray.length === 0) {
            popupGridContainer.innerHTML =
                "<p style='grid-column: span 3; text-align:center;'>Đơn hàng này không có sản phẩm.</p>";
            popupPaginationContainer.innerHTML = "";
            return;
        }

        // Thuật toán cắt mảng lấy vị trí phần tử theo phân trang khách yêu cầu
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

                return `
        <div class="popup-product-card">
          <img src="${imgPath}" class="popup-product-img" alt="${prod.product_name}">
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

        // Đếm tổng số trang có thể có của Form popup
        const totalPopupPages = Math.ceil(orderProductsArray.length / itemsPerPage);
        buildPopupPaginationControls(totalPopupPages);

        // Kích hoạt sự kiện bấm nút "Xem chi tiết" sâu bên trong từng thẻ sản phẩm nhỏ (Bật Modal thứ 2)
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
            popupPaginationContainer.innerHTML = ""; // Nếu tổng số sản phẩm từ 3 món đổ xuống thì không hiện nút làm gì cho rối mắt
            return;
        }

        popupPaginationContainer.innerHTML = `
      <button type="button" class="btn-mod-page" id="popupPrevBtn" ${currentPopupPage === 1 ? "disabled" : ""}>← Trước</button>
      <span id="modalPageInfo">Trang ${currentPopupPage} / ${totalPages}</span>
      <button type="button" class="btn-mod-page" id="popupNextBtn" ${currentPopupPage === totalPages ? "disabled" : ""}>Sau →</button>
    `;

        // Lắng nghe sự kiện nút lùi trang
        document.getElementById("popupPrevBtn").addEventListener("click", () => {
            if (currentPopupPage > 1) {
                currentPopupPage--;
                renderPopupGrid();
            }
        });

        // Lắng nghe sự kiện nút tiến trang
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

    // Tắt modal khi click chuột ra ngoài rìa màn hình trống
    window.addEventListener("click", (e) => {
        if (e.target === orderItemsModal) orderItemsModal.style.display = "none";
        if (e.target === productDetailModal)
            productDetailModal.style.display = "none";
    });
});
