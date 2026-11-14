
const adminStudentService = require("../services/adminStudentService");

// 1. Get all students
const getAllStudents = async (req, res) => {
    try {
        const students = await adminStudentService.getAllStudents();

        return res.status(200).json({
            success: true,
            message: "Students fetched successfully",
            total: students.length,
            data: students
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 2. Get single student
const getStudentById = async (req, res) => {
    try {
        const student = await adminStudentService.getStudentById(
            req.params.id
        );

        return res.status(200).json({
            success: true,
            message: "Student fetched successfully",
            data: student
        });
    } catch (error) {
        const statusCode = error.message === "Student not found" ? 404 : 400;

        return res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

// 3. Update student
const updateStudent = async (req, res) => {
    try {
        const student = await adminStudentService.updateStudent(
            req.params.id,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Student updated successfully",
            data: student
        });
    } catch (error) {
        const statusCode = error.message === "Student not found" ? 404 : 400;

        return res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

// 4. Block / unblock student
const updateStudentStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const student = await adminStudentService.updateStudentStatus(
            req.params.id,
            status
        );

        return res.status(200).json({
            success: true,
            message: `Student ${status} successfully`,
            data: student
        });
    } catch (error) {
        const statusCode = error.message === "Student not found" ? 404 : 400;

        return res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

// 5. Delete student
const deleteStudent = async (req, res) => {
    try {
        await adminStudentService.deleteStudent(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Student deleted successfully"
        });
    } catch (error) {
        const statusCode = error.message === "Student not found" ? 404 : 400;

        return res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getAllStudents,
    getStudentById,
    updateStudent,
    updateStudentStatus,
    deleteStudent
};
