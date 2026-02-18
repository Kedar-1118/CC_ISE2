const RequestLog = require('../models/RequestLog');
const Project = require('../models/Project');

/**
 * Request Logger Middleware
 *
 * Intercepts all requests to /mock/* routes and logs them
 * to the RequestLogs collection for analytics.
 *
 * Runs AFTER the response is sent (using res.on('finish'))
 * to avoid slowing down the actual request.
 */
const requestLogger = (req, res, next) => {
    // Only log /mock/ routes
    if (!req.originalUrl.startsWith('/mock/')) {
        return next();
    }

    const startTime = Date.now();

    // Hook into the response finish event
    res.on('finish', async () => {
        try {
            // Extract project basePath from URL
            const pathParts = req.originalUrl.replace('/mock/', '').split('/');
            const projectPath = pathParts[0];

            if (!projectPath) return;

            // Find project to get its ID
            const project = await Project.findOne({ basePath: projectPath }).select('_id');
            if (!project) return;

            await RequestLog.create({
                projectId: project._id,
                endpoint: req.originalUrl,
                method: req.method,
                body: ['POST', 'PUT', 'PATCH'].includes(req.method) ? req.body : null,
                statusCode: res.statusCode,
                timestamp: new Date(),
            });
        } catch (error) {
            // Silently fail — logging should never break the request
            console.error('Request logging error:', error.message);
        }
    });

    next();
};

module.exports = requestLogger;
