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

// Hàm sinh mã HTML dùng chung cho cả 2 Modal Thêm và Sửa
function createBlockHTML(imgUrl = "", heading = "", paragraph = "") {
    return `
        <div class="content-block" style="border: 1px dashed #ccc; padding: 15px; margin-bottom: 15px; border-radius: 6px; position: relative; background: #fafafa;">
            <button type="button" class="btn-delete-block" onclick="this.parentElement.remove()" style="position: absolute; right: 10px; top: 10px; background: #ff4d4d; color: white; border: none; border-radius: 4px; padding: 2px 8px; cursor: pointer; font-size: 12px;">Xóa đoạn</button>
            
            <div class="form-group" style="margin-bottom: 10px;">
                <label style="font-size: 13px; display:block; text-align:left; font-weight: bold; margin-bottom:4px;">Câu hỏi / Tiêu đề đoạn (Thẻ H3)</label>
                <input type="text" class="block-heading" value="${heading}" style="width: 100%; padding: 6px; border: 1px solid #ccc; border-radius:4px;" placeholder="Ví dụ: 1. Ý tưởng thiết kế đến từ đâu?">
            </div>
            
            <div class="form-group" style="margin-bottom: 10px;">
                <label style="font-size: 13px; display:block; text-align:left; font-weight: bold; margin-bottom:4px;">Đường dẫn hình ảnh đoạn (Không bắt buộc)</label>
                <input type="text" class="block-image" value="${imgUrl}" style="width: 100%; padding: 6px; border: 1px solid #ccc; border-radius:4px;" placeholder="Dán link ảnh tại đây...">
            </div>
            
            <div class="form-group" style="margin-bottom: 0;">
                <label style="font-size: 13px; display:block; text-align:left; font-weight: bold; margin-bottom:4px;">Nội dung đoạn văn (Thẻ P)</label>
                <textarea class="block-paragraph" rows="3" style="width: 100%; padding: 6px; border: 1px solid #ccc; border-radius:4px;" placeholder="Nhập nội dung chi tiết của phân đoạn...">${paragraph}</textarea>
            </div>
        </div>
    `;
}

// Hàm gom dữ liệu từ các khối content-block thành mã HTML hoàn chỉnh
function compileBlocksToHTML(containerSelector) {
    let compiledHTML = "";
    const container = document.getElementById(containerSelector);
    if (!container) return "";

    const blocks = container.querySelectorAll(".content-block");
    blocks.forEach((block) => {
        const headingVal = block.querySelector(".block-heading").value.trim();
        const imgVal = block.querySelector(".block-image").value.trim();
        const paraVal = block.querySelector(".block-paragraph").value.trim();

        if (imgVal !== "") {
            compiledHTML += `        <img src="${imgVal}" alt="${headingVal}">\n`;
        }
        if (headingVal !== "") {
            compiledHTML += `        <h3>${headingVal}</h3>\n`;
        }
        if (paraVal !== "") {
            compiledHTML += `        <p>${paraVal}</p>\n\n`;
        }
    });
    return compiledHTML;
}

// ==========================================
// THIẾT LẬP LOGIC CHO MODAL THÊM MỚI BÀI VIẾT
// ==========================================
const postModal = document.getElementById("postModal");
const postOpenBtn = document.getElementById("openPostModal");
const postCloseBtn = document.querySelector(".close-post-modal");
const addDynamicContainer = document.getElementById(
    "add-dynamic-blocks-container",
);
const addBlockBtnInAddModal = document.getElementById(
    "add-block-btn-add-modal",
);
const addPostForm = document.getElementById("addPostForm");

if (postModal && postOpenBtn) {
    postOpenBtn.addEventListener("click", () => {
        postModal.style.display = "block";
        // Mỗi lần mở modal thêm mới, tự động reset container và tạo sẵn 1 ô nhập liệu đầu tiên
        if (addDynamicContainer) {
            addDynamicContainer.innerHTML = createBlockHTML(
                "",
                "1. Tổng quan dự án",
                "",
            );
        }
    });

    if (addBlockBtnInAddModal && addDynamicContainer) {
        addBlockBtnInAddModal.addEventListener("click", () => {
            addDynamicContainer.insertAdjacentHTML("beforeend", createBlockHTML());
        });
    }

    if (addPostForm) {
        addPostForm.addEventListener("submit", (e) => {
            const htmlResult = compileBlocksToHTML("add-dynamic-blocks-container");
            document.getElementById("add_post_content_hidden").value = htmlResult;
        });
    }

    if (postCloseBtn) {
        postCloseBtn.addEventListener("click", () => {
            postModal.style.display = "none";
        });
    }
    window.addEventListener("click", (e) => {
        if (e.target === postModal) postModal.style.display = "none";
    });
}

// ==========================================
// THIẾT LẬP LOGIC CHO MODAL SỬA BÀI VIẾT
// ==========================================
const editPostModal = document.getElementById("editPostModal");
const editPostForm = document.getElementById("editPostForm");
const editDynamicContainer = document.getElementById(
    "dynamic-blocks-container",
);
const addBlockBtnInEditModal = document.getElementById("add-block-btn");

if (editPostModal && editPostForm) {
    document.querySelectorAll(".edit-post-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            editPostModal.style.display = "block";

            // Đổ dữ liệu cơ bản vào Form 1 (bên trái)
            document.getElementById("edit_post_id").value = btn.dataset.id;
            document.getElementById("edit_post_title").value = btn.dataset.title;
            document.getElementById("edit_post_thumbnail").value =
                btn.dataset.thumbnail || "";
            document.getElementById("edit_post_category").value =
                btn.dataset.categoryid;
            document.getElementById("edit_post_summary").value =
                btn.dataset.summary || "";

            editPostForm.action = `/admin/dashboard/posts/edit/${btn.dataset.id}`;

            // Bóc tách HTML cũ đổ vào Form 2 (bên phải)
            if (editDynamicContainer) {
                editDynamicContainer.innerHTML = "";
                const rawHTML = btn.dataset.content || "";

                const parser = new DOMParser();
                const doc = parser.parseFromString(rawHTML, "text/html");
                const headings = doc.querySelectorAll("h3");

                if (headings.length > 0) {
                    headings.forEach((h3) => {
                        let imgUrl = "";
                        let paragraphText = "";

                        let prevElem = h3.previousElementSibling;
                        if (prevElem && prevElem.tagName.toLowerCase() === "img") {
                            imgUrl = prevElem.getAttribute("src") || "";
                        }

                        let nextElem = h3.nextElementSibling;
                        if (nextElem && nextElem.tagName.toLowerCase() === "p") {
                            paragraphText = nextElem.innerHTML || "";
                        }

                        editDynamicContainer.insertAdjacentHTML(
                            "beforeend",
                            createBlockHTML(imgUrl, h3.innerHTML, paragraphText),
                        );
                    });
                } else {
                    editDynamicContainer.insertAdjacentHTML(
                        "beforeend",
                        createBlockHTML("", "Nội dung bài viết", rawHTML),
                    );
                }
            }
        });
    });

    if (addBlockBtnInEditModal && editDynamicContainer) {
        addBlockBtnInEditModal.addEventListener("click", () => {
            editDynamicContainer.insertAdjacentHTML("beforeend", createBlockHTML());
        });
    }

    editPostForm.addEventListener("submit", (e) => {
        const htmlResult = compileBlocksToHTML("dynamic-blocks-container");
        document.getElementById("edit_post_content_hidden").value = htmlResult;
    });

    const closeEditPostBtn = document.querySelector(".close-edit-post");
    if (closeEditPostBtn) {
        closeEditPostBtn.addEventListener("click", () => {
            editPostModal.style.display = "none";
        });
    }
    window.addEventListener("click", (e) => {
        if (e.target === editPostModal) editPostModal.style.display = "none";
    });
}
