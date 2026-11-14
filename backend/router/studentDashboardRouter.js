const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const studentDashboardController = require("../controllers/studentDashboardController");
const studentMiddleware = require("../middleware/studentMiddleware");
// Student Dashboard
router.get(
    "/",
    authMiddleware,
    studentMiddleware,
    studentDashboardController.getStudentDashboard
);

module.exports = router;