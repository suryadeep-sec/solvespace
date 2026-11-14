
const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const adminSetupController = require("../controllers/adminSetupController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const adminDashboardController = require("../controllers/adminDashboardController");
const adminStudentController = require("../controllers/adminStudentController");

const adminProblemController = require("../controllers/adminProblemController");
// Initial Admin Setup
router.post(
    "/setup",
    adminSetupController.createInitialAdmin
);

// Admin Login
router.post(
    "/login",
    adminController.adminLogin
);

// Verify Admin Access
router.get(
    "/verify",
    authMiddleware,
    adminMiddleware,
    (req, res) => {
        res.status(200).json({
            success: true,
            message: "Admin access verified",
            admin: req.user
        });
    }
);
router.get(
    "/dashboard",
    authMiddleware,
    adminMiddleware,
    adminDashboardController.getDashboardStats
);

router.get(
    "/students",
    authMiddleware,
    adminMiddleware,
    adminStudentController.getAllStudents
);

router.get(
    "/students/:id",
    authMiddleware,
    adminMiddleware,
    adminStudentController.getStudentById
);

router.put(
    "/students/:id",
    authMiddleware,
    adminMiddleware,
    adminStudentController.updateStudent
);

router.patch(
    "/students/:id/status",
    authMiddleware,
    adminMiddleware,
    adminStudentController.updateStudentStatus
);

router.delete(
    "/students/:id",
    authMiddleware,
    adminMiddleware,
    adminStudentController.deleteStudent
);



// ===============================
// ADMIN PROBLEM MANAGEMENT
// ===============================

// Get All Problems
router.get(
    "/problems",
    authMiddleware,
    adminMiddleware,
    adminProblemController.getAllProblems
);

// Get Single Problem
router.get(
    "/problems/:id",
    authMiddleware,
    adminMiddleware,
    adminProblemController.getProblemById
);

// Update Problem
router.put(
    "/problems/:id",
    authMiddleware,
    adminMiddleware,
    adminProblemController.updateProblem
);

// Update Problem Status
router.patch(
    "/problems/:id/status",
    authMiddleware,
    adminMiddleware,
    adminProblemController.updateProblemStatus
);

// Delete Problem
router.delete(
    "/problems/:id",
    authMiddleware,
    adminMiddleware,
    adminProblemController.deleteProblem
);



module.exports = router;
