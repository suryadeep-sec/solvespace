const studentMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    if (req.user.role !== "student") {
        return res.status(403).json({
            success: false,
            message: "Access denied. Students only."
        });
    }

    next();
};

module.exports = studentMiddleware;