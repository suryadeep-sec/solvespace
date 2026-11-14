
const User = require("../models/userModel");
const Problem = require("../model/problem");

const getDashboardStats = async () => {
    const totalStudents = await User.countDocuments({
        role: "student"
    });

    const totalAdmins = await User.countDocuments({
        role: "admin"
    });

    const totalProblems = await Problem.countDocuments();

    return {
        totalStudents,
        totalAdmins,
        totalProblems
    };
};

module.exports = {
    getDashboardStats
};
