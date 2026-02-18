const mongoose = require('mongoose');

/**
 * RequestLog Schema
 *
 * Stores a log entry for every request hitting the /mock/* dynamic routes.
 * Used for analytics and debugging on the frontend dashboard.
 */
const requestLogSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    endpoint: {
        type: String,
        required: true,
    },
    method: {
        type: String,
        required: true,
        enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    },
    body: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
    },
    statusCode: {
        type: Number,
        default: 200,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

// Index for efficient queries by project
requestLogSchema.index({ projectId: 1, timestamp: -1 });

module.exports = mongoose.model('RequestLog', requestLogSchema);
