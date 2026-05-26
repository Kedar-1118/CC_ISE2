const mongoose = require('mongoose');

/**
 * User Schema
 *
 * Minimal user model for OTP-based authentication.
 * No password field — authentication is handled entirely via email OTP.
 */
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('User', userSchema);
