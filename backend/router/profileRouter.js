
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const profileController = require("../controllers/profileController");

// Get Student Profile
router.get(
    "/me",
    authMiddleware,
    profileController.getProfile
);

// Update Student Profile
router.put(
    "/update",
    authMiddleware,
    profileController.updateProfile
);

module.exports = router;
