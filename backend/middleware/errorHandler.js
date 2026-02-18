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
        return res.status(400).json({
            success: false,
            error: messages.join(', '),
        });
    }

    // Mongoose bad ObjectId
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        return res.status(400).json({
            success: false,
            error: 'Invalid ID format',
        });
    }

    // JSON parse error
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({
            success: false,
            error: 'Invalid JSON in request body',
        });
    }

    // Default 500
    res.status(err.statusCode || 500).json({
        success: false,
        error: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

module.exports = errorHandler;
