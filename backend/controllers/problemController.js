const Problem = require("../model/problem");

const createProblem = async (req, res, next) => {
  try {
    const {
      title,
      description,
      subject,
      instructions,
      deadline,
    } = req.body;

    const problem = await Problem.create({
      title,
      description,
      subject,
      instructions,
      deadline,
      createdBy: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Problem created successfully",
      data: {
        problem,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAllProblems = async (req, res, next) => {
  try {
    const problems = await Problem.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Problems fetched successfully",
      total: problems.length,
      data: {
        problems,
      },
    });
  } catch (error) {
    next(error);
  }
};


const getSingleProblem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const problem = await Problem.findById(id)
      .populate("createdBy", "name email");

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Problem fetched successfully",
      data: {
        problem,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateProblem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const allowedFields = [
      "title",
      "description",
      "subject",
      "instructions",
      "deadline",
      "status",
    ];

    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    const problem = await Problem.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).populate("createdBy", "name email");

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Problem updated successfully",
      data: {
        problem,
      },
    });
  } catch (error) {
    next(error);
  }
};


const deleteProblem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const problem = await Problem.findByIdAndDelete(id);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Problem deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {

    createProblem,
    getAllProblems,
    getSingleProblem,
    updateProblem,
    deleteProblem
};