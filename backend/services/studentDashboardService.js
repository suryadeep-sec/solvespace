const Problem = require("../model/problem");
const Submission = require("../model/submission");

const getStudentDashboard = async (studentId) => {

    const totalProblems = await Problem.countDocuments();

    const activeProblems = await Problem.countDocuments({
        status: "active"
    });

    const closedProblems = await Problem.countDocuments({
        status: "closed"
    });

    const totalSubmissions = await Submission.countDocuments({
        student: studentId
    });

    const pendingSubmissions = await Submission.countDocuments({
        student: studentId,
        status: "pending"
    });

    const approvedSubmissions = await Submission.countDocuments({
        student: studentId,
        status: "approved"
    });

    const rejectedSubmissions = await Submission.countDocuments({
        student: studentId,
        status: "rejected"
    });

    return {
        totalProblems,
        activeProblems,
        closedProblems,
        totalSubmissions,
        pendingSubmissions,
        approvedSubmissions,
        rejectedSubmissions
    };
};

module.exports = {
    getStudentDashboard
};