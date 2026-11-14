
const submissionService = require("../services/submissionService");
const Submission = require("../model/submission");
const path = require("path");
const fs = require("fs");

// ========================================
// STUDENT: CREATE SUBMISSION
// ========================================

const createSubmission = async (req, res) => {
    try {
        const attachments = (req.files || []).map((file) => ({
            fileName: file.filename,
            originalName: file.originalname,
            fileUrl: `/api/submissions/${req.body.problemId}/attachments/${file.filename}`,
            mimeType: file.mimetype,
            size: file.size
        }));

        const submissionData = {
            ...req.body,
            attachments
        };

        const submission = await submissionService.createSubmission(
            req.user.id,
            submissionData
        );

        return res.status(201).json({
            success: true,
            message: "Submission created successfully",
            data: { submission }
        });

    } catch (error) {
        const statusCode =
            error.message === "Problem not found" ? 404 : 400;

        return res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

// ========================================
// ADMIN: GET ALL SUBMISSIONS
// ========================================

const getAllSubmissions = async (req, res) => {
    try {
        const submissions = await submissionService.getAllSubmissions();

        return res.status(200).json({
            success: true,
            message: "Submissions fetched successfully",
            total: submissions.length,
            data: { submissions }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ========================================
// ADMIN: GET SINGLE SUBMISSION
// ========================================

const getSubmissionById = async (req, res) => {
    try {
        const submission = await submissionService.getSubmissionById(
            req.params.id
        );

        return res.status(200).json({
            success: true,
            message: "Submission fetched successfully",
            data: { submission }
        });

    } catch (error) {
        const statusCode =
            error.message === "Submission not found" ? 404 : 400;

        return res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

// ========================================
// ADMIN: REVIEW SUBMISSION
// ========================================

const reviewSubmission = async (req, res) => {
    try {
        const submission = await submissionService.reviewSubmission(
            req.params.id,
            req.user.id,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Submission reviewed successfully",
            data: { submission }
        });

    } catch (error) {
        const statusCode =
            error.message === "Submission not found" ? 404 : 400;

        return res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

// ========================================
// STUDENT: GET MY SUBMISSIONS
// ========================================

const getMySubmissions = async (req, res) => {
    try {
        const submissions = await submissionService.getMySubmissions(
            req.user.id
        );

        return res.status(200).json({
            success: true,
            message: "Your submissions fetched successfully",
            total: submissions.length,
            data: { submissions }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ========================================
// STUDENT / ADMIN: DOWNLOAD ATTACHMENT
// ========================================

const downloadAttachment = async (req, res) => {
    try {
        const { submissionId, fileName } = req.params;

        // Prevent path traversal
        if (path.basename(fileName) !== fileName) {
            return res.status(400).json({
                success: false,
                message: "Invalid file name"
            });
        }

        const submission = await Submission.findById(submissionId);

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: "Submission not found"
            });
        }

        // Student can access only their own submission
        if (
            req.user.role === "student" &&
            submission.student.toString() !== req.user.id
        ) {
            return res.status(403).json({
                success: false,
                message: "You cannot access this submission"
            });
        }

        // Find requested attachment in database
        const attachment = submission.attachments.find(
            (file) => file.fileName === fileName
        );

        if (!attachment) {
            return res.status(404).json({
                success: false,
                message: "Attachment not found"
            });
        }

        const filePath = path.join(
            __dirname,
            "../uploads/submissions",
            attachment.fileName
        );

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: "File does not exist on server"
            });
        }

        return res.download(
            filePath,
            attachment.originalName
        );

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to download attachment"
        });
    }
};

// ========================================
// EXPORT CONTROLLER FUNCTIONS
// ========================================

module.exports = {
    createSubmission,
    getAllSubmissions,
    getSubmissionById,
    getMySubmissions,
    reviewSubmission,
    downloadAttachment
};
