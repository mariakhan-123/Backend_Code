const express = require('express');
const router = express.Router();
const User = require('../modals/user');
// Create a user
const userController = require('../controller/userController');
const { LoginValidation, SignUpValidation} = require('../middleware/middleware');

router.post('/signup',SignUpValidation, userController.signup);
router.post('/login',LoginValidation, userController.login);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);

module.exports = router;
