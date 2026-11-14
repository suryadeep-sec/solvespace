
const userService = require("../services/userService");

// Student Registration
const registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        const user = await userService.registerUser({
            name,
            email,
            password
        });

        return res.status(201).json({
            success: true,
            message: "Student registered successfully",
            data: {
                user
            }
        });

    } catch (error) {
        next(error);
    }
};


// Student Login
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const result = await userService.loginUser({
            email,
            password
        });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: result
        });

    } catch (error) {
        next(error);
    }
};


module.exports = {
    registerUser,
    loginUser
};


const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        const result = await userService.changePassword({
            userId: req.user.id,
            currentPassword,
            newPassword,
            confirmPassword
        });

        return res.status(200).json({
            success: true,
            message: result.message
        });

    } catch (error) {
        next(error);
    }
};


module.exports = {
    registerUser,
    loginUser,
    changePassword
};

