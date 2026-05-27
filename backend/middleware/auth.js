const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');

/**
 * JWT Authentication Middleware
 *
 * Protects dashboard API routes (project management).
 * Extracts JWT from httpOnly cookie, verifies it, and attaches req.user.
 *
 * Usage: app.use('/api/projects', authMiddleware, projectRoutes);
 */
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null) || req.cookies?.token;

        if (!token) {
            logger.warn(`Auth failed: No token provided for ${req.method} ${req.originalUrl}`);
            return res.status(401).json({
                success: false,
                error: 'Authentication required. Please log in.',
            });
        }

        // Verify JWT
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                logger.warn('Auth failed: Token expired');
                return res.status(401).json({
                    success: false,
                    error: 'Session expired. Please log in again.',
                });
            }
            logger.warn(`Auth failed: Invalid token — ${err.message}`);
            return res.status(401).json({
                success: false,
                error: 'Invalid authentication token.',
            });
        }

        // Find user
        const user = await User.findById(decoded.userId).select('-__v');
        if (!user) {
            logger.warn(`Auth failed: User not found for ID ${decoded.userId}`);
            return res.status(401).json({
                success: false,
                error: 'User not found. Please log in again.',
            });
        }

        req.user = user;
        next();
    } catch (error) {
        logger.error(`Auth middleware error: ${error.message}`);
        next(error);
    }
};

module.exports = authMiddleware;
