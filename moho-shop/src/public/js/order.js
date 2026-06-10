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
// =============================================
// CHỨC NĂNG IN ĐƠN HÀNG RA PDF
// =============================================
document.querySelectorAll('.btn-print-order').forEach(btn => {
    btn.addEventListener('click', async function () {
        const orderId = this.dataset.id;
        const custName = this.dataset.name;
        const phone = this.dataset.phone;
        const date = this.dataset.date;
        const status = this.dataset.status;

        // Map trạng thái sang tiếng Việt
        const statusMap = {
            pending: 'Chờ xử lý',
            completed: 'Hoàn thành',
            cancelled: 'Đã hủy bỏ'
        };

        // Gọi API lấy danh sách sản phẩm trong đơn
        let items = [];
        try {
            const res = await fetch(`/admin/dashboard/orders/api/items?order_id=${orderId}`);
            items = await res.json();
        } catch (e) {
            alert('Không thể tải dữ liệu đơn hàng!');
            return;
        }

        // Tính tổng tiền
        const total = items.reduce((sum, it) => sum + (Number(it.unit_price) * Number(it.quantity)), 0);

        // Tạo HTML cho các dòng sản phẩm
        const rows = items.map((it, idx) => `
            <tr>
                <td style="padding:8px;border:1px solid #ddd;text-align:center;">${idx + 1}</td>
                <td style="padding:8px;border:1px solid #ddd;">${it.product_name || '---'}</td>
                <td style="padding:8px;border:1px solid #ddd;text-align:center;">${it.product_sku || '---'}</td>
                <td style="padding:8px;border:1px solid #ddd;text-align:center;">${it.quantity}</td>
                <td style="padding:8px;border:1px solid #ddd;text-align:right;">${Number(it.unit_price).toLocaleString('vi-VN')}đ</td>
                <td style="padding:8px;border:1px solid #ddd;text-align:right;font-weight:bold;">
                    ${(Number(it.unit_price) * Number(it.quantity)).toLocaleString('vi-VN')}đ
                </td>
            </tr>
        `).join('');

        // Tạo nội dung trang in
        const printContent = `
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <title>Đơn hàng #ORD${orderId}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: Arial, sans-serif; font-size: 13px; color: #222; padding: 32px; }
                    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
                    .logo { font-size: 24px; font-weight: bold; color: #2c3e50; }
                    .order-title { text-align: right; }
                    .order-title h2 { font-size: 20px; color: #2c3e50; }
                    .order-title p { color: #666; font-size: 12px; margin-top: 4px; }
                    .divider { border: none; border-top: 2px solid #2c3e50; margin: 16px 0; }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
                    .info-box { background: #f8f9fa; padding: 12px 16px; border-radius: 6px; }
                    .info-box h4 { font-size: 11px; text-transform: uppercase; color: #888; margin-bottom: 8px; letter-spacing: 0.5px; }
                    .info-box p { margin-bottom: 4px; font-size: 13px; }
                    .badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; }
                    .badge-pending   { background: #fef3c7; color: #d97706; }
                    .badge-completed { background: #d1fae5; color: #059669; }
                    .badge-cancelled { background: #fee2e2; color: #dc2626; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
                    thead tr { background: #2c3e50; color: white; }
                    thead th { padding: 10px 8px; text-align: left; font-size: 12px; }
                    tbody tr:nth-child(even) { background: #f8f9fa; }
                    .total-row { text-align: right; margin-top: 8px; font-size: 15px; }
                    .total-row strong { color: #e74c3c; font-size: 18px; }
                    .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #aaa; border-top: 1px solid #eee; padding-top: 12px; }
                    @media print {
                        body { padding: 16px; }
                        @page { margin: 1cm; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo">🛋️ MOHO</div>
                    <div class="order-title">
                        <h2>HÓA ĐƠN ĐẶT HÀNG</h2>
                        <p>#ORD${orderId} — ${date}</p>
                    </div>
                </div>
                <hr class="divider">

                <div class="info-grid">
                    <div class="info-box">
                        <h4>Thông tin khách hàng</h4>
                        <p><strong>Họ tên:</strong> ${custName}</p>
                        <p><strong>Điện thoại:</strong> ${phone}</p>
                    </div>
                    <div class="info-box">
                        <h4>Thông tin đơn hàng</h4>
                        <p><strong>Mã đơn:</strong> #ORD${orderId}</p>
                        <p><strong>Ngày đặt:</strong> ${date}</p>
                        <p><strong>Trạng thái:</strong>
                            <span class="badge badge-${status}">${statusMap[status] || status}</span>
                        </p>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th style="width:40px;">STT</th>
                            <th>Tên sản phẩm</th>
                            <th style="width:100px;">SKU</th>
                            <th style="width:60px;text-align:center;">SL</th>
                            <th style="width:110px;text-align:right;">Đơn giá</th>
                            <th style="width:120px;text-align:right;">Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>

                <div class="total-row">
                    Tổng cộng: <strong>${total.toLocaleString('vi-VN')}đ</strong>
                </div>

                <div class="footer">
                    Cảm ơn quý khách đã tin tưởng và mua sắm tại MOHO! — Tài liệu được tạo tự động bởi hệ thống quản trị.
                </div>
            </body>
            </html>
        `;

        // Mở cửa sổ in
        const printWin = window.open('', '_blank', 'width=800,height=600');
        printWin.document.open();
        printWin.document.write(printContent);
        printWin.document.close();

        // Chờ load xong rồi mới in
        printWin.onload = function () {
            printWin.focus();
            printWin.print();
        };
    });
});

