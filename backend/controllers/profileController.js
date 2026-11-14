
const User = require("../models/userModel");

// Get Student Profile
const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile fetched successfully",
            data: { user }
        });

    } catch (error) {
        next(error);
    }
};


// Update Student Profile
const updateProfile = async (req, res, next) => {
    try {
        const { name } = req.body;

        // Validate name
        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Valid name is required"
            });
        }

        if (name.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: "Name must contain at least 2 characters"
            });
        }

        // Update authenticated student's profile
        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                name: name.trim()
            },
            {
                new: true,
                runValidators: true
            }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: { user }
        });

    } catch (error) {
        next(error);
    }
};


module.exports = {
    getProfile,
    updateProfile
};
