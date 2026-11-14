
const adminSetupService = require("../services/adminSetupService");

const createInitialAdmin = async (req, res) => {
    try {
        const { name, email, password, setupKey } = req.body;

        // Validate required fields
        if (!name || !email || !password || !setupKey) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Validate password length
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters"
            });
        }

        // Create initial admin
        const admin = await adminSetupService.createInitialAdmin({
            name,
            email,
            password,
            setupKey
        });

        return res.status(201).json({
            success: true,
            message: "Initial admin account created successfully",
            data: admin
        });

    } catch (error) {
        const statusCode = error.statusCode
            || (error.name === "ValidationError" ? 400 : error.code === 11000 ? 409 : 500);

        return res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createInitialAdmin
};
