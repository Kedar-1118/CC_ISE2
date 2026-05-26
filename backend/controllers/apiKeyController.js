const { v4: uuidv4 } = require('uuid');
const Project = require('../models/Project');
const logger = require('../config/logger');

/**
 * @desc    Reset API key for a project (preserves rate limit data)
 * @route   POST /api/projects/:id/reset-key
 */
exports.resetApiKey = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            logger.warn(`Reset key failed — project not found: ${req.params.id}`);
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        // Verify ownership
        if (project.owner.toString() !== req.user._id.toString()) {
            logger.warn(`Reset key failed — unauthorized user ${req.user._id} for project ${req.params.id}`);
            return res.status(403).json({ success: false, error: 'Not authorized to reset this key' });
        }

        const oldKeyPrefix = project.apiKey.substring(0, 8);
        const newKey = uuidv4();

        // Update only the API key — weeklyRateLimit data is deliberately preserved
        project.apiKey = newKey;
        await project.save();

        logger.info(`API key reset for project "${project.projectName}": ${oldKeyPrefix}... → ${newKey.substring(0, 8)}... (rate data preserved: ${project.weeklyRateLimit.requestCount} requests)`);

        res.json({
            success: true,
            data: {
                apiKey: newKey,
                weeklyRateLimit: {
                    requestCount: project.weeklyRateLimit.requestCount,
                    weekStart: project.weeklyRateLimit.weekStart,
                    limit: project.weeklyRateLimit.limit,
                },
            },
            message: 'API key has been reset. The old key will no longer work. Rate limit data has been preserved.',
        });
    } catch (error) {
        logger.error(`Error in resetApiKey: ${error.message}`);
        next(error);
    }
};
