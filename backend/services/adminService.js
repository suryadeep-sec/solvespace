const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const adminLogin = async ({ email, password }) => {
    const admin = await User.findOne({
        email: email.toLowerCase().trim(),
        role: "admin"
    }).select("+password");

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    const token = jwt.sign(
        {
            id: admin._id,
            role: admin.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "1d"
        }
    );

    return {
        admin: {
            id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role
        },
        token
    };
};

module.exports = {
    adminLogin
};
