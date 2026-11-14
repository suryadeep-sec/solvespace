
const express = require("express");
const router = express.Router();

// Middlewares
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const studentMiddleware = require("../middleware/studentMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Controller
const submissionController = require("../controllers/submissionController");

// ========================================
// STUDENT ROUTES
// ========================================

// Create submission with attachments
router.post(
    "/",
    authMiddleware,
    studentMiddleware,
    upload.array("attachments", 5),
    submissionController.createSubmission
);

// Get my submissions
router.get(
    "/my",
    authMiddleware,
    studentMiddleware,
    submissionController.getMySubmissions
);

// ========================================
// SECURE FILE DOWNLOAD
// ========================================

// Student can download own files
router.get(
    "/:submissionId/attachments/:fileName",
    authMiddleware,
    submissionController.downloadAttachment
);

// ========================================
// ADMIN ROUTES
// ========================================

// Get all submissions
router.get(
    "/",
    authMiddleware,
    adminMiddleware,
    submissionController.getAllSubmissions
);

// Get single submission
router.get(
    "/:id",
    authMiddleware,
    adminMiddleware,
    submissionController.getSubmissionById
);

// Review submission
router.patch(
    "/:id/review",
    authMiddleware,
    adminMiddleware,
    submissionController.reviewSubmission
);

module.exports = router;
