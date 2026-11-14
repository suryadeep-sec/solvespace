const studentDashboardService = require("../services/studentDashboardService");

// Get Student Dashboard
const getStudentDashboard = async (req, res) => {
    try {
        const dashboard = await studentDashboardService.getStudentDashboard(
            req.user.id
        );

        return res.status(200).json({
            success: true,
            message: "Student dashboard fetched successfully",
            data: { dashboard }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getStudentDashboard
};