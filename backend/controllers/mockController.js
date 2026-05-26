const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger');

/**
 * Dynamic Mock Route Engine
 *
 * Handles all CRUD operations on mock collections.
 * Routes: /api/:apiKey/:collection[/:id]
 *
 * The apiKeyAuth middleware has already validated the API key,
 * checked the rate limit, and attached req.project — so these
 * handlers simply use req.project without additional DB lookups.
 */

/**
 * @desc    GET all records in a collection, or a single record by _id
 * @route   GET /api/:apiKey/:collection
 * @route   GET /api/:apiKey/:collection/:id
 */
exports.getRecords = async (req, res, next) => {
    try {
        const { collection, id } = req.params;
        const project = req.project;

        const records = project.collections.get(collection);
        if (!records) {
            logger.warn(`Collection not found: ${collection} in project ${project.projectName}`);
            return res.status(404).json({ success: false, error: `Collection "${collection}" not found` });
        }

        // Single record by _id
        if (id) {
            const record = records.find((r) => r._id === id);
            if (!record) {
                logger.warn(`Record not found: ${id} in ${project.projectName}/${collection}`);
                return res.status(404).json({ success: false, error: 'Record not found' });
            }
            logger.info(`GET record ${id} from ${project.projectName}/${collection}`);
            return res.json(record);
        }

        // All records
        logger.info(`GET all records from ${project.projectName}/${collection} (${records.length} records)`);
        res.json(records);
    } catch (error) {
        logger.error(`Error in getRecords: ${error.message}`);
        next(error);
    }
};

/**
 * @desc    Create a new record in a collection
 * @route   POST /api/:apiKey/:collection
 */
exports.createRecord = async (req, res, next) => {
    try {
        const { collection } = req.params;
        const body = req.body;
        const project = req.project;

        if (!body || typeof body !== 'object' || Array.isArray(body)) {
            logger.warn(`Invalid request body for POST ${project.projectName}/${collection}`);
            return res.status(400).json({ success: false, error: 'Request body must be a JSON object' });
        }

        const records = project.collections.get(collection);
        if (!records) {
            logger.warn(`Collection not found: ${collection} in project ${project.projectName}`);
            return res.status(404).json({ success: false, error: `Collection "${collection}" not found` });
        }

        const newRecord = { _id: uuidv4(), ...body };
        records.push(newRecord);

        project.collections.set(collection, records);
        project.markModified('collections');
        await project.save();

        logger.info(`Created record in ${project.projectName}/${collection}: ${newRecord._id}`);
        res.status(201).json(newRecord);
    } catch (error) {
        logger.error(`Error in createRecord: ${error.message}`);
        next(error);
    }
};

/**
 * @desc    Update a record by _id
 * @route   PUT /api/:apiKey/:collection/:id
 */
exports.updateRecord = async (req, res, next) => {
    try {
        const { collection, id } = req.params;
        const body = req.body;
        const project = req.project;

        if (!body || typeof body !== 'object' || Array.isArray(body)) {
            logger.warn(`Invalid request body for PUT ${project.projectName}/${collection}/${id}`);
            return res.status(400).json({ success: false, error: 'Request body must be a JSON object' });
        }

        const records = project.collections.get(collection);
        if (!records) {
            logger.warn(`Collection not found: ${collection} in project ${project.projectName}`);
            return res.status(404).json({ success: false, error: `Collection "${collection}" not found` });
        }

        const index = records.findIndex((r) => r._id === id);
        if (index === -1) {
            logger.warn(`Record not found for update: ${id} in ${project.projectName}/${collection}`);
            return res.status(404).json({ success: false, error: 'Record not found' });
        }

        // Merge existing record with updated fields, preserving _id
        records[index] = { ...records[index], ...body, _id: id };

        project.collections.set(collection, records);
        project.markModified('collections');
        await project.save();

        logger.info(`Updated record ${id} in ${project.projectName}/${collection}`);
        res.json(records[index]);
    } catch (error) {
        logger.error(`Error in updateRecord: ${error.message}`);
        next(error);
    }
};

/**
 * @desc    Delete a record by _id
 * @route   DELETE /api/:apiKey/:collection/:id
 */
exports.deleteRecord = async (req, res, next) => {
    try {
        const { collection, id } = req.params;
        const project = req.project;

        const records = project.collections.get(collection);
        if (!records) {
            logger.warn(`Collection not found: ${collection} in project ${project.projectName}`);
            return res.status(404).json({ success: false, error: `Collection "${collection}" not found` });
        }

        const index = records.findIndex((r) => r._id === id);
        if (index === -1) {
            logger.warn(`Record not found for delete: ${id} in ${project.projectName}/${collection}`);
            return res.status(404).json({ success: false, error: 'Record not found' });
        }

        records.splice(index, 1);

        project.collections.set(collection, records);
        project.markModified('collections');
        await project.save();

        logger.info(`Deleted record ${id} from ${project.projectName}/${collection}`);
        res.json({ success: true, data: {} });
    } catch (error) {
        logger.error(`Error in deleteRecord: ${error.message}`);
        next(error);
    }
};
