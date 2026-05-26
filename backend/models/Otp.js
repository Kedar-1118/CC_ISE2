const mongoose = require('mongoose');

/**
 * OTP Schema
 *
 * Stores one-time passwords for email verification.
 * The TTL index on `createdAt` auto-deletes documents after 5 minutes,
 * so expired OTPs are cleaned up automatically by MongoDB.
 */
const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    code: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300, // 5-minute TTL — MongoDB auto-deletes after expiry
    },
});

// Index for fast lookup by email
otpSchema.index({ email: 1 });

module.exports = mongoose.model('Otp', otpSchema);
