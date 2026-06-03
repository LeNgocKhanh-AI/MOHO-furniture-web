document.addEventListener("DOMContentLoaded", () => {
    const provinceSelect = document.getElementById("provinceSelect");
    const showroomItems = document.querySelectorAll(".showroom-item");
    const mapIframe = document.getElementById("mapIframe");

    // 1. Click từng showroom -> Thay đổi bản đồ tương ứng bên phải
    showroomItems.forEach((item) => {
        item.addEventListener("click", () => {
            // Xóa active cũ, thêm active mới
            document
                .querySelector(".showroom-item.active")
                ?.classList.remove("active");
            item.classList.add("active");

            // Lấy link map nhúng từ data-map gán vào iframe src
            const newMapUrl = item.getAttribute("data-map");
            mapIframe.src = newMapUrl;
        });
    });

    // 2. Bộ lọc danh sách cửa hàng dựa theo Tỉnh/Thành phố chọn trên <select>
    provinceSelect.addEventListener("change", (e) => {
        const selectedProvince = e.target.value;
        let firstVisibleItem = null;

        showroomItems.forEach((item) => {
            const itemProvince = item.getAttribute("data-province");

            if (selectedProvince === "all" || itemProvince === selectedProvince) {
                item.style.display = "block"; // Hiện showroom
                if (!firstVisibleItem) firstVisibleItem = item; // Đánh dấu showroom đầu tiên để click tự động
            } else {
                item.style.display = "none"; // Ẩn showroom khác tỉnh
            }
        });

        // Tự động kích hoạt hiển thị bản đồ của showroom đầu tiên thuộc Tỉnh/Thành phố đó
        if (firstVisibleItem) {
            firstVisibleItem.click();
        }
    });
});
