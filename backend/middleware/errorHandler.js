const logger = require('../config/logger');

/**
 * Global Error Handler Middleware
 *
 * Catches all unhandled errors and returns a clean JSON response.
 * In development mode, includes the stack trace for debugging.
 */
const errorHandler = (err, req, res, _next) => {
    console.error('❌ Error:', err.message);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((e) => e.message);
        logger.warn(`Validation error on ${req.method} ${req.originalUrl}: ${messages.join(', ')}`, { labels: { errorType: 'ValidationError' } });
        return res.status(400).json({
            success: false,
            error: messages.join(', '),
        });
    }

    // Mongoose bad ObjectId
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        logger.warn(`Invalid ObjectId on ${req.method} ${req.originalUrl}`, { labels: { errorType: 'CastError' } });
        return res.status(400).json({
            success: false,
            error: 'Invalid ID format',
        });
    }

    // JSON parse error
    if (err.type === 'entity.parse.failed') {
        logger.warn(`Invalid JSON body on ${req.method} ${req.originalUrl}`, { labels: { errorType: 'ParseError' } });
        return res.status(400).json({
            success: false,
            error: 'Invalid JSON in request body',
        });
    }

    // Default 500
    logger.error(`Server error on ${req.method} ${req.originalUrl}: ${err.message}`, { labels: { errorType: 'ServerError', statusCode: String(err.statusCode || 500) } });
    res.status(err.statusCode || 500).json({
        success: false,
        error: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

module.exports = errorHandler;
