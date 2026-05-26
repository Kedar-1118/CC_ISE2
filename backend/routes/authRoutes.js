const express = require('express');
const router = express.Router();
const { sendOtp, verifyOtp, logout, getMe } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Public routes (no JWT required)
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/logout', logout);

// Protected route (requires JWT)
router.get('/me', authMiddleware, getMe);

module.exports = router;
