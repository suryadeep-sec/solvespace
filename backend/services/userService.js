
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Student Registration
const registerUser = async (userData) => {

    const email = userData.email.toLowerCase().trim();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        const error = new Error("User already exists with this email");
        error.statusCode = 409;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const user = await User.create({
        name: userData.name,
        email,
        password: hashedPassword
    });

    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    };
};


// Student Login
const loginUser = async (userData) => {

    // 1. Normalize email
    const email = userData.email.toLowerCase().trim();

    // 2. Find user and include password
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    // 3. Compare password
    const isPasswordCorrect = await bcrypt.compare(
        userData.password,
        user.password
    );

    if (!isPasswordCorrect) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    // 4. Generate JWT token
    const token = jwt.sign(
        {
            id: user._id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "1d"
        }
    );

    // 5. Return safe response
    return {
        token,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    };
};


module.exports = {
    registerUser,
    loginUser
};



const changePassword = async (userData) => {

    const {
        userId,
        currentPassword,
        newPassword,
        confirmPassword
    } = userData;

    // 1. Validate required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
        const error = new Error("All password fields are required");
        error.statusCode = 400;
        throw error;
    }

    // 2. Validate new password length
    if (newPassword.length < 8) {
        const error = new Error("New password must be at least 8 characters");
        error.statusCode = 400;
        throw error;
    }

    // 3. Confirm password match
    if (newPassword !== confirmPassword) {
        const error = new Error("New password and confirm password do not match");
        error.statusCode = 400;
        throw error;
    }

    // 4. Find authenticated user
    const user = await User.findById(userId).select("+password");

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    // 5. Verify current password
    const isPasswordCorrect = await bcrypt.compare(
        currentPassword,
        user.password
    );

    if (!isPasswordCorrect) {
        const error = new Error("Current password is incorrect");
        error.statusCode = 401;
        throw error;
    }

    // 6. Prevent same password reuse
    const isSamePassword = await bcrypt.compare(
        newPassword,
        user.password
    );

    if (isSamePassword) {
        const error = new Error("New password must be different");
        error.statusCode = 400;
        throw error;
    }

    // 7. Hash new password
    user.password = await bcrypt.hash(newPassword, 12);

    // 8. Save updated password
    await user.save();

    return {
        message: "Password changed successfully"
    };
};

module.exports = {
    registerUser,
    loginUser,
    changePassword
};
