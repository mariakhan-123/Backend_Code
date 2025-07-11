const express = require("express");
const {signup,login,forgotPassword,verifyOtp,resetPassword} = require("../controller/userController");
const { SignUpValidation, LoginValidation, Auth } = require("../middleware/middleware");

const router = express.Router();

router.post("/signup", SignUpValidation, signup);
router.post("/login", LoginValidation, login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp); 
router.post("/reset-password", resetPassword);

module.exports = router;
