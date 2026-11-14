
const adminDashboardService = require("../services/adminDashboardService");

const getDashboardStats = async (req, res) => {
    try {
        const stats = await adminDashboardService.getDashboardStats();

        return res.status(200).json({
            success: true,
            message: "Dashboard statistics fetched successfully",
            data: stats
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard statistics"
        });
    }
};

module.exports = {
    getDashboardStats
};
