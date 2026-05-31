const labels = orderChartData.map((item) => {
    const date = new Date(item.orderDay);

    return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "short",
    });
});
const totals = orderChartData.map((item) => item.totalOrders);

const ctx = document.getElementById("orderChart");

new Chart(ctx, {
    type: "line",

    data: {
        labels: labels,

        datasets: [
            {
                label: "Số lượng đơn hàng",

                data: totals,

                borderColor: "#0284c7",

                backgroundColor: "rgba(2,132,199,0.2)",

                tension: 0.3,

                fill: true,
            },
        ],
    },

    options: {
        responsive: true,

        plugins: {
            legend: {
                display: true,
            },
        },

        scales: {
            y: {
                beginAtZero: true,
            },
        },
    },
});

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

// ================================
// REVENUE CHART
// ================================

const revenueLabels = revenueChartData.map((item) => {
    const date = new Date(item.revenueDay);

    return date.toLocaleDateString("vi-VN");
});

const revenueTotals = revenueChartData.map((item) => item.totalRevenue);

const revenueCtx = document.getElementById("revenueChart");

new Chart(revenueCtx, {
    type: "bar",

    data: {
        labels: revenueLabels,

        datasets: [
            {
                label: "Doanh thu",

                data: revenueTotals,

                backgroundColor: "#22c55e",

                borderRadius: 6,
            },
        ],
    },

    options: {
        responsive: true,

        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return context.raw.toLocaleString("vi-VN") + " VNĐ";
                    },
                },
            },
        },

        scales: {
            y: {
                beginAtZero: true,

                ticks: {
                    callback: function (value) {
                        return value.toLocaleString("vi-VN") + "đ";
                    },
                },
            },
        },
    },
});

// ================================
// CUSTOMER CHART
// ================================

const customerLabels = customerChartData.map((item) => {
    const date = new Date(item.customerDay);

    return date.toLocaleDateString("vi-VN");
});

const customerTotals = customerChartData.map((item) => item.totalCustomers);

const customerCtx = document.getElementById("customerChart");

new Chart(customerCtx, {
    type: "line",

    data: {
        labels: customerLabels,

        datasets: [
            {
                label: "Khách hàng đăng ký",

                data: customerTotals,

                borderColor: "#3b82f6",

                backgroundColor: "rgba(59,130,246,0.2)",

                tension: 0.4,

                fill: true,
            },
        ],
    },

    options: {
        responsive: true,

        plugins: {
            legend: {
                display: true,
            },
        },

        scales: {
            y: {
                beginAtZero: true,

                ticks: {
                    precision: 0,
                },
            },
        },
    },
});
