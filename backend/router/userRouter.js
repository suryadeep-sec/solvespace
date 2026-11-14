
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const userController = require("../controllers/userController");

router.post("/register", userController.registerUser);

router.post("/login", userController.loginUser);


router.put(
    "/change-password",
    authMiddleware,
    userController.changePassword
);

module.exports = router;
