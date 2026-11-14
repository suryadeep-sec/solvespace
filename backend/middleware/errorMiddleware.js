
const errorMiddleware = (err, req, res, next) => {

    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // MongoDB duplicate key error
    if (err.code === 11000) {
        statusCode = 409;
        message = "Email already registered";
    }

    // Mongoose validation error
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors)
            .map(error => error.message)
            .join(", ");
    }

    // Invalid MongoDB ObjectId
    if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid resource ID";
    }

    res.status(statusCode).json({
        success: false,
        message
    });
};

module.exports = errorMiddleware;
