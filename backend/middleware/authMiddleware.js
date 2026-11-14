
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access denied. Token required."
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Fetch actual user from database
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found. Please login again."
            });
        }

        // Check blocked account (students)
        if (
            user.role === "student" &&
            user.accountStatus === "blocked"
        ) {
            return res.status(403).json({
                success: false,
                message: "Your account has been blocked. Contact administrator."
            });
        }

        // Attach fresh database information
        req.user = {
            id: user._id.toString(),
            role: user.role,
            name: user.name,
            email: user.email
        };

        next();

    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token expired. Please login again."
            });
        }

        return res.status(401).json({
            success: false,
            message: "Invalid authentication token."
        });
    }
};

module.exports = authMiddleware;
