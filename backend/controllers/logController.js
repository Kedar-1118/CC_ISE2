const RequestLog = require('../models/RequestLog');
const logger = require('../config/logger');

/**
 * @desc    Get request logs for a project (most recent first, limited to 100)
 * @route   GET /api/projects/:id/logs
 */
exports.getLogsByProject = async (req, res, next) => {
    try {
        const logs = await RequestLog.find({ projectId: req.params.id })
            .sort({ timestamp: -1 })
            .limit(100)
            .lean();

        logger.info(`Fetched ${logs.length} logs for project ${req.params.id}`);
        res.json({ success: true, count: logs.length, data: logs });
    } catch (error) {
        logger.error(`Error fetching logs for project ${req.params.id}: ${error.message}`);
        next(error);
    }
};
