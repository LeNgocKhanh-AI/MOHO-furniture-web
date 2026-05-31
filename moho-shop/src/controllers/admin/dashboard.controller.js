const dashboardService = require("../../services/dashboard.service");

const index = async (req, res) => {
    try {
        // Gọi service
        const stats = await dashboardService.getDashboardStats();

        // Dữ liệu biểu đồ
        const orderChart = await dashboardService.getOrderChartData();

        // Biểu đồ doanh thu
        const revenueChart = await dashboardService.getRevenueChartData();

        // Customer chart
        const customerChart = await dashboardService.getCustomerChartData();

        // Render dashboard
        res.render("admin/dashboard", {
            stats,
            orderChart,
            revenueChart,
            customerChart,
        });
    } catch (error) {
        console.log(error);
    }
};

module.exports = {
    index,
};
