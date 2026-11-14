
const Submission = require("../model/submission");
const Problem = require("../model/problem");

// ========================================
// STUDENT: CREATE SUBMISSION
// ========================================

const createSubmission = async (studentId, submissionData) => {
    const { problemId, answer, attachments } = submissionData;

    const problem = await Problem.findById(problemId);

    if (!problem) {
        throw new Error("Problem not found");
    }

    if (problem.status !== "active") {
        throw new Error("This problem is closed");
    }

    if (problem.deadline < new Date()) {
        throw new Error("Submission deadline has passed");
    }

    if (
        (!answer || !answer.trim()) &&
        (!attachments || attachments.length === 0)
    ) {
        throw new Error("Answer or attachment is required");
    }

    const existingSubmission = await Submission.findOne({
        problem: problemId,
        student: studentId
    });

    if (existingSubmission) {
        throw new Error("You have already submitted this problem");
    }

    const submission = await Submission.create({
        problem: problemId,
        student: studentId,
        answer: answer || "",
        attachments: attachments || []
    });

    // Generate correct secure download URLs
    submission.attachments = submission.attachments.map((file) => {
        file.fileUrl =
            `/api/submissions/${submission._id}/attachments/${file.fileName}`;

        return file;
    });

    await submission.save();

    return submission;
};

// ========================================
// ADMIN: GET ALL SUBMISSIONS
// ========================================

const getAllSubmissions = async () => {
    return await Submission.find()
        .populate("student", "name email")
        .populate("problem", "title subject deadline")
        .populate("reviewedBy", "name email")
        .sort({ createdAt: -1 })
        .lean();
};

// ========================================
// ADMIN: GET SINGLE SUBMISSION
// ========================================

const getSubmissionById = async (submissionId) => {
    const submission = await Submission.findById(submissionId)
        .populate("student", "name email")
        .populate("problem", "title subject deadline")
        .populate("reviewedBy", "name email")
        .lean();

    if (!submission) {
        throw new Error("Submission not found");
    }

    return submission;
};

// ========================================
// ADMIN: REVIEW SUBMISSION
// ========================================

const reviewSubmission = async (
    submissionId,
    adminId,
    reviewData
) => {
    const { status, adminFeedback } = reviewData;

    if (!["approved", "rejected"].includes(status)) {
        throw new Error("Status must be approved or rejected");
    }

    const submission = await Submission.findById(submissionId);

    if (!submission) {
        throw new Error("Submission not found");
    }

    submission.status = status;
    submission.adminFeedback = adminFeedback || "";
    submission.reviewedBy = adminId;
    submission.reviewedAt = new Date();

    await submission.save();

    return await Submission.findById(submissionId)
        .populate("student", "name email")
        .populate("problem", "title subject deadline")
        .populate("reviewedBy", "name email")
        .lean();
};

// ========================================
// STUDENT: GET MY SUBMISSIONS
// ========================================

const getMySubmissions = async (studentId) => {
    return await Submission.find({
        student: studentId
    })
        .populate("problem", "title subject deadline")
        .populate("reviewedBy", "name email")
        .sort({ createdAt: -1 })
        .lean();
};

// ========================================
// EXPORT SERVICE FUNCTIONS
// ========================================

module.exports = {
    createSubmission,
    getAllSubmissions,
    getSubmissionById,
    reviewSubmission,
    getMySubmissions
};
