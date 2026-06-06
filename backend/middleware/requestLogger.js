const RequestLog = require('../models/RequestLog');
const logger = require('../config/logger');
const { mockRequestsTotal, mockRequestDuration } = require('../config/metrics');

/**
 * Request Logger Middleware
 *
 * Intercepts all requests to /api/:apiKey/* mock routes and logs them
 * to the RequestLogs collection for analytics.
 *
 * Runs AFTER the response is sent (using res.on('finish'))
 * to avoid slowing down the actual request.
 *
 * Uses req.project (set by apiKeyAuth middleware) to get the project ID
 * directly, avoiding a separate DB lookup.
 */
const requestLogger = (req, res, next) => {
    // Only log mock API routes (those that will have req.project set by apiKeyAuth)
    // Pattern: /api/:apiKey/:collection — skip /api/auth/*, /api/projects/*, /api/health
    const path = req.originalUrl;
    if (
        path.startsWith('/api/auth') ||
        path.startsWith('/api/projects') ||
        path.startsWith('/api/health') ||
        path === '/api' ||
        path === '/api/'
    ) {
        return next();
    }

    // Check if this looks like a mock API route: /api/:apiKey/:collection
    const parts = path.replace('/api/', '').split('/').filter(Boolean);
    if (parts.length < 2) {
        return next();
    }

    const startTime = Date.now();
    const collection = parts[1] || 'unknown'; // /api/:apiKey/:collection

    // Hook into the response finish event
    res.on('finish', async () => {
        try {
            // req.project is set by apiKeyAuth middleware
            if (!req.project) return;

            const responseTime = Date.now() - startTime;
            const durationSeconds = responseTime / 1000;

            // ── Prometheus metrics ────────────────────────
            mockRequestsTotal.inc({
                method: req.method,
                collection,
                status_code: String(res.statusCode),
            });
            mockRequestDuration.observe({ method: req.method, collection }, durationSeconds);

            await RequestLog.create({
                projectId: req.project._id,
                endpoint: req.originalUrl,
                method: req.method,
                body: ['POST', 'PUT', 'PATCH'].includes(req.method) ? req.body : null,
                statusCode: res.statusCode,
                timestamp: new Date(),
            });

            logger.info(`Mock request logged: ${req.method} ${req.originalUrl} ${res.statusCode} ${responseTime}ms`, {
                labels: { type: 'mock-request', method: req.method, status: String(res.statusCode), collection },
            });
        } catch (error) {
            logger.error(`Request logging error: ${error.message}`, { labels: { type: 'logging-error' } });
            console.error('Request logging error:', error.message);
        }
    });

    next();
};

module.exports = requestLogger;
