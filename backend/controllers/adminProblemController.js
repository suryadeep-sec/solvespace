
const adminProblemService = require("../services/adminProblemService");

// Common Error Handler
const handleError = (res, error) => {
    const statusCode =
        error.message === "Problem not found" ? 404 :
        error.message === "Invalid problem ID" ||
        error.message.startsWith("Invalid status") ||
        error.message.startsWith("No valid fields") ? 400 : 500;

    return res.status(statusCode).json({
        success: false,
        message: error.message
    });
};

// Get All Problems
const getAllProblems = async (req, res) => {
    try {
        const problems = await adminProblemService.getAllProblems();

        return res.status(200).json({
            success: true,
            message: "Problems fetched successfully",
            total: problems.length,
            data: { problems }
        });
    } catch (error) {
        return handleError(res, error);
    }
};

// Get Single Problem
const getProblemById = async (req, res) => {
    try {
        const problem = await adminProblemService.getProblemById(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Problem fetched successfully",
            data: { problem }
        });
    } catch (error) {
        return handleError(res, error);
    }
};

// Update Problem
const updateProblem = async (req, res) => {
    try {
        const problem = await adminProblemService.updateProblem(
            req.params.id,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Problem updated successfully",
            data: { problem }
        });
    } catch (error) {
        return handleError(res, error);
    }
};

// Update Problem Status
const updateProblemStatus = async (req, res) => {
    try {
        const problem = await adminProblemService.updateProblemStatus(
            req.params.id,
            req.body.status
        );

        return res.status(200).json({
            success: true,
            message: "Problem status updated successfully",
            data: { problem }
        });
    } catch (error) {
        return handleError(res, error);
    }
};

// Delete Problem
const deleteProblem = async (req, res) => {
    try {
        await adminProblemService.deleteProblem(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Problem deleted successfully"
        });
    } catch (error) {
        return handleError(res, error);
    }
};

module.exports = {
    getAllProblems,
    getProblemById,
    updateProblem,
    updateProblemStatus,
    deleteProblem
};
