const mongoose = require('mongoose');

/**
 * Project Schema
 *
 * Represents a mock API project created by a user.
 * - projectName  : unique human-readable name
 * - basePath     : URL-safe slug derived from projectName (used in /mock/:basePath/...)
 * - collections  : Map where each key is a collection name and the value is an array of record objects.
 *                  Each record gets an auto-generated `_id` string field.
 * - createdAt    : timestamp of creation
 */
const projectSchema = new mongoose.Schema({
    projectName: {
        type: String,
        required: [true, 'Project name is required'],
        unique: true,
        trim: true,
        maxlength: [100, 'Project name cannot exceed 100 characters'],
    },
    basePath: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
    },
    collections: {
        type: Map,
        of: [mongoose.Schema.Types.Mixed],
        default: {},
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

/**
 * Pre-validate hook: auto-generate basePath from projectName.
 * Converts to lowercase, replaces spaces/special chars with hyphens.
 */
projectSchema.pre('validate', function (next) {
    if (this.projectName && !this.basePath) {
        this.basePath = this.projectName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    next();
});

module.exports = mongoose.model('Project', projectSchema);
