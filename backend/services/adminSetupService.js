const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

const createInitialAdmin = async ({ name, email, password, setupKey }) => {
    if (!process.env.ADMIN_SETUP_KEY || setupKey !== process.env.ADMIN_SETUP_KEY) {
        const error = new Error("Invalid admin setup key");
        error.statusCode = 403;
        throw error;
    }

    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin) {
        const error = new Error("Admin account already exists");
        error.statusCode = 409;
        throw error;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
        const error = new Error("Email is already registered");
        error.statusCode = 409;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const admin = await User.create({
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: "admin"
    });

    return {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
    };
};

module.exports = {
    createInitialAdmin
};
