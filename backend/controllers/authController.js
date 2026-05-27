const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Otp = require('../models/Otp');
const logger = require('../config/logger');

// Configure Nodemailer transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        family: 4, // Force IPv4 to avoid slow DNS lookup / TCP timeout on IPv6
        connectionTimeout: 10000, // 10 seconds connection timeout
        greetingTimeout: 10000,   // 10 seconds greeting timeout
        socketTimeout: 10000,     // 10 seconds socket timeout
    });
};

/**
 * Generate a 6-digit numeric OTP
 */
const generateOtp = () => {
    return crypto.randomInt(100000, 999999).toString();
};

/**
 * Sign a JWT with 7-day expiry
 */
const signToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

/**
 * Set JWT as httpOnly cookie
 */
const sendTokenCookie = (res, token) => {
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
    });
};

/**
 * @desc    Send OTP to email
 * @route   POST /api/auth/send-otp
 */
exports.sendOtp = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required',
            });
        }

        // Basic email validation
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Please enter a valid email address',
            });
        }

        // Delete any existing OTPs for this email (prevent spam/confusion)
        await Otp.deleteMany({ email: email.toLowerCase() });

        // Generate and store OTP
        const code = generateOtp();
        await Otp.create({ email: email.toLowerCase(), code });

        // Send OTP via email (non-blocking in background)
        const transporter = createTransporter();
        transporter.sendMail({
            from: `"MockAPI" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Your MockAPI Login Code',
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #1e1e2e; color: #cdd6f4; border-radius: 12px;">
                    <h2 style="margin: 0 0 8px; color: #89b4fa;">MockAPI</h2>
                    <p style="color: #a6adc8; margin: 0 0 24px; font-size: 14px;">Your verification code</p>
                    <div style="background: #181825; border: 1px solid rgba(137,180,250,0.2); border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
                        <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #89b4fa;">${code}</span>
                    </div>
                    <p style="color: #6c7086; font-size: 13px; margin: 0;">This code expires in 5 minutes. If you didn't request this, please ignore this email.</p>
                </div>
            `,
        }).then(() => {
            logger.info(`OTP email sent successfully to ${email}`);
        }).catch((err) => {
            logger.error(`Failed to send OTP email to ${email}: ${err.message}`);
        });

        // Log OTP to console in development for easier local testing
        if (process.env.NODE_ENV !== 'production') {
            console.log(`🔑 [DEV ONLY] OTP for ${email}: ${code}`);
        }

        logger.info(`OTP generation triggered for ${email}`);
        res.json({
            success: true,
            message: 'OTP sent to your email',
        });
    } catch (error) {
        logger.error(`Send OTP error: ${error.message}`);
        next(error);
    }
};

/**
 * @desc    Verify OTP and login/signup
 * @route   POST /api/auth/verify-otp
 */
exports.verifyOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                error: 'Email and OTP are required',
            });
        }

        // Find the most recent OTP for this email
        const otpDoc = await Otp.findOne({ email: email.toLowerCase() }).sort({ createdAt: -1 });

        if (!otpDoc) {
            return res.status(400).json({
                success: false,
                error: 'OTP has expired or was not requested. Please request a new one.',
            });
        }

        if (otpDoc.code !== otp.toString()) {
            return res.status(400).json({
                success: false,
                error: 'Invalid OTP. Please try again.',
            });
        }

        // OTP is valid — delete all OTPs for this email
        await Otp.deleteMany({ email: email.toLowerCase() });

        // Find or create user
        let user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            user = await User.create({ email: email.toLowerCase() });
            logger.info(`New user registered: ${email}`);
        }

        // Sign JWT and set cookie
        const token = signToken(user._id);
        sendTokenCookie(res, token);

        logger.info(`User logged in: ${email}`);
        res.json({
            success: true,
            data: {
                id: user._id,
                email: user.email,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        logger.error(`Verify OTP error: ${error.message}`);
        next(error);
    }
};

/**
 * @desc    Logout — clear JWT cookie
 * @route   POST /api/auth/logout
 */
exports.logout = (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: 0,
        path: '/',
    });

    logger.info('User logged out');
    res.json({ success: true, message: 'Logged out successfully' });
};

/**
 * @desc    Get current authenticated user
 * @route   GET /api/auth/me
 */
exports.getMe = async (req, res) => {
    res.json({
        success: true,
        data: {
            id: req.user._id,
            email: req.user.email,
            createdAt: req.user.createdAt,
        },
    });
};
