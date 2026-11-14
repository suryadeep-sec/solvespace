
const Problem = require("../model/problem");
const mongoose = require("mongoose");

// Get All Problems
const getAllProblems = async () => {
    return await Problem.find()
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .lean();
};

// Get Single Problem
const getProblemById = async (problemId) => {
    if (!mongoose.Types.ObjectId.isValid(problemId)) {
        throw new Error("Invalid problem ID");
    }

    const problem = await Problem.findById(problemId)
        .populate("createdBy", "name email")
        .lean();

    if (!problem) {
        throw new Error("Problem not found");
    }

    return problem;
};

// Update Problem
const updateProblem = async (problemId, updateData) => {
    if (!mongoose.Types.ObjectId.isValid(problemId)) {
        throw new Error("Invalid problem ID");
    }

    const allowedFields = [
        "title",
        "description",
        "subject",
        "instructions",
        "deadline"
    ];

    const updates = {};

    allowedFields.forEach((field) => {
        if (updateData[field] !== undefined) {
            updates[field] = updateData[field];
        }
    });

    if (Object.keys(updates).length === 0) {
        throw new Error("No valid fields provided for update");
    }

    const problem = await Problem.findByIdAndUpdate(
        problemId,
        { $set: updates },
        { new: true, runValidators: true }
    ).populate("createdBy", "name email");

    if (!problem) {
        throw new Error("Problem not found");
    }

    return problem;
};

// Update Problem Status
const updateProblemStatus = async (problemId, status) => {
    if (!mongoose.Types.ObjectId.isValid(problemId)) {
        throw new Error("Invalid problem ID");
    }

    if (!["active", "closed"].includes(status)) {
        throw new Error("Invalid status. Use active or closed");
    }

    const problem = await Problem.findByIdAndUpdate(
        problemId,
        { status },
        { new: true, runValidators: true }
    );

    if (!problem) {
        throw new Error("Problem not found");
    }

    return problem;
};

// Delete Problem
const deleteProblem = async (problemId) => {
    if (!mongoose.Types.ObjectId.isValid(problemId)) {
        throw new Error("Invalid problem ID");
    }

    const problem = await Problem.findByIdAndDelete(problemId);

    if (!problem) {
        throw new Error("Problem not found");
    }

    return problem;
};

module.exports = {
    getAllProblems,
    getProblemById,
    updateProblem,
    updateProblemStatus,
    deleteProblem
};
