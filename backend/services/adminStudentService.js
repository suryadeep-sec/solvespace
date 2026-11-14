
const mongoose = require("mongoose");
const User = require("../models/userModel");

// 1. Get all students
const getAllStudents = async () => {
    const students = await User.find({ role: "student" })
        .select("-password")
        .sort({ createdAt: -1 })
        .lean();

    return students.map(student => ({
        ...student,
        accountStatus: student.accountStatus || "active"
    }));
};

// 2. Get single student
const getStudentById = async (studentId) => {
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        throw new Error("Invalid student ID");
    }

    const student = await User.findOne({
        _id: studentId,
        role: "student"
    }).select("-password").lean();

    if (!student) {
        throw new Error("Student not found");
    }

    return {
        ...student,
        accountStatus: student.accountStatus || "active"
    };
};

// 3. Update student details
const updateStudent = async (studentId, updateData) => {
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        throw new Error("Invalid student ID");
    }

    const allowedUpdates = {};

    if (updateData.name !== undefined) {
        allowedUpdates.name = updateData.name;
    }

    if (updateData.email !== undefined) {
        allowedUpdates.email = updateData.email.toLowerCase().trim();
    }

    if (Object.keys(allowedUpdates).length === 0) {
        throw new Error("No valid fields provided for update");
    }

    const student = await User.findOneAndUpdate(
        {
            _id: studentId,
            role: "student"
        },
        allowedUpdates,
        {
            new: true,
            runValidators: true
        }
    ).select("-password");

    if (!student) {
        throw new Error("Student not found");
    }

    return student;
};

// 4. Block or unblock student
const updateStudentStatus = async (studentId, status) => {
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        throw new Error("Invalid student ID");
    }

    if (!["active", "blocked"].includes(status)) {
        throw new Error("Status must be active or blocked");
    }

    const student = await User.findOneAndUpdate(
        {
            _id: studentId,
            role: "student"
        },
        {
            accountStatus: status
        },
        {
            new: true,
            runValidators: true
        }
    ).select("-password");

    if (!student) {
        throw new Error("Student not found");
    }

    return student;
};

// 5. Delete student
const deleteStudent = async (studentId) => {
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        throw new Error("Invalid student ID");
    }

    const student = await User.findOneAndDelete({
        _id: studentId,
        role: "student"
    });

    if (!student) {
        throw new Error("Student not found");
    }

    return student;
};

module.exports = {
    getAllStudents,
    getStudentById,
    updateStudent,
    updateStudentStatus,
    deleteStudent
};
