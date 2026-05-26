const Project = require('../models/Project');
const logger = require('../config/logger');

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * API Key Authentication & Weekly Rate Limit Middleware
 *
 * For mock API routes (/api/:apiKey/:collection).
 * Does NOT require JWT — API keys are standalone authentication.
 *
 * Flow:
 * 1. Extract apiKey from URL params
 * 2. Look up project by apiKey
 * 3. Check/reset weekly rate limit window
 * 4. Enforce rate limit
 * 5. Increment request counter atomically
 * 6. Attach req.project for downstream handlers
 */
const apiKeyAuth = async (req, res, next) => {
    try {
        const { apiKey } = req.params;

        if (!apiKey) {
            return res.status(401).json({
                success: false,
                error: 'API key is required',
            });
        }

        // Find project by API key
        const project = await Project.findOne({ apiKey });
        if (!project) {
            logger.warn(`API key auth failed: Invalid key ${apiKey.substring(0, 8)}...`);
            return res.status(401).json({
                success: false,
                error: 'Invalid API key',
            });
        }

        const now = new Date();
        const weekStart = new Date(project.weeklyRateLimit.weekStart);
        const elapsed = now.getTime() - weekStart.getTime();

        // Check if the 7-day window has passed — auto-reset
        if (elapsed >= SEVEN_DAYS_MS) {
            project.weeklyRateLimit.requestCount = 0;
            project.weeklyRateLimit.weekStart = now;
            logger.info(`Weekly rate limit reset for project "${project.projectName}" (API key: ${apiKey.substring(0, 8)}...)`);
        }

        // Enforce rate limit
        const limit = project.weeklyRateLimit.limit || parseInt(process.env.WEEKLY_RATE_LIMIT) || 500;
        if (project.weeklyRateLimit.requestCount >= limit) {
            const resetDate = new Date(project.weeklyRateLimit.weekStart.getTime() + SEVEN_DAYS_MS);
            logger.warn(`Rate limit exceeded for project "${project.projectName}" (${project.weeklyRateLimit.requestCount}/${limit})`);
            return res.status(429).json({
                success: false,
                error: 'Weekly rate limit exceeded',
                rateLimit: {
                    limit,
                    used: project.weeklyRateLimit.requestCount,
                    resetsAt: resetDate.toISOString(),
                },
            });
        }

        // Increment counter atomically
        project.weeklyRateLimit.requestCount += 1;
        project.markModified('weeklyRateLimit');
        await project.save();

        // Attach project for downstream use (avoids redundant DB lookups in controllers)
        req.project = project;
        next();
    } catch (error) {
        logger.error(`API key auth error: ${error.message}`);
        next(error);
    }
};

module.exports = apiKeyAuth;
