const Project = require('../models/Project');
const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger');

/**
 * Dynamic Mock Route Engine
 *
 * Handles all CRUD operations on mock collections.
 * Routes: /mock/:projectPath/:collection[/:id]
 *
 * This is the core engine that makes the platform work —
 * it fetches the project from DB, finds the right collection,
 * performs the operation, and saves back to MongoDB.
 */

/**
 * @desc    GET all records in a collection, or a single record by _id
 * @route   GET /mock/:projectPath/:collection
 * @route   GET /mock/:projectPath/:collection/:id
 */
exports.getRecords = async (req, res, next) => {
    try {
        const { projectPath, collection, id } = req.params;

        const project = await Project.findOne({ basePath: projectPath });
        if (!project) {
            logger.warn(`Project not found: ${projectPath}`);
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        const records = project.collections.get(collection);
        if (!records) {
            logger.warn(`Collection not found: ${collection} in project ${projectPath}`);
            return res.status(404).json({ success: false, error: `Collection "${collection}" not found` });
        }

        // Single record by _id
        if (id) {
            const record = records.find((r) => r._id === id);
            if (!record) {
                logger.warn(`Record not found: ${id} in ${projectPath}/${collection}`);
                return res.status(404).json({ success: false, error: 'Record not found' });
            }
            logger.info(`GET record ${id} from ${projectPath}/${collection}`);
            return res.json(record);
        }

        // All records
        logger.info(`GET all records from ${projectPath}/${collection} (${records.length} records)`);
        res.json(records);
    } catch (error) {
        logger.error(`Error in getRecords: ${error.message}`);
        next(error);
    }
};

/**
 * @desc    Create a new record in a collection
 * @route   POST /mock/:projectPath/:collection
 */
exports.createRecord = async (req, res, next) => {
    try {
        const { projectPath, collection } = req.params;
        const body = req.body;

        if (!body || typeof body !== 'object' || Array.isArray(body)) {
            logger.warn(`Invalid request body for POST ${projectPath}/${collection}`);
            return res.status(400).json({ success: false, error: 'Request body must be a JSON object' });
        }

        const project = await Project.findOne({ basePath: projectPath });
        if (!project) {
            logger.warn(`Project not found: ${projectPath}`);
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        const records = project.collections.get(collection);
        if (!records) {
            logger.warn(`Collection not found: ${collection} in project ${projectPath}`);
            return res.status(404).json({ success: false, error: `Collection "${collection}" not found` });
        }

        const newRecord = { _id: uuidv4(), ...body };
        records.push(newRecord);

        project.collections.set(collection, records);
        project.markModified('collections');
        await project.save();

        logger.info(`Created record in ${projectPath}/${collection}: ${newRecord._id}`);
        res.status(201).json(newRecord);
    } catch (error) {
        logger.error(`Error in createRecord: ${error.message}`);
        next(error);
    }
};

/**
 * @desc    Update a record by _id
 * @route   PUT /mock/:projectPath/:collection/:id
 */
exports.updateRecord = async (req, res, next) => {
    try {
        const { projectPath, collection, id } = req.params;
        const body = req.body;

        if (!body || typeof body !== 'object' || Array.isArray(body)) {
            logger.warn(`Invalid request body for PUT ${projectPath}/${collection}/${id}`);
            return res.status(400).json({ success: false, error: 'Request body must be a JSON object' });
        }

        const project = await Project.findOne({ basePath: projectPath });
        if (!project) {
            logger.warn(`Project not found: ${projectPath}`);
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        const records = project.collections.get(collection);
        if (!records) {
            logger.warn(`Collection not found: ${collection} in project ${projectPath}`);
            return res.status(404).json({ success: false, error: `Collection "${collection}" not found` });
        }

        const index = records.findIndex((r) => r._id === id);
        if (index === -1) {
            logger.warn(`Record not found for update: ${id} in ${projectPath}/${collection}`);
            return res.status(404).json({ success: false, error: 'Record not found' });
        }

        // Merge existing record with updated fields, preserving _id
        records[index] = { ...records[index], ...body, _id: id };

        project.collections.set(collection, records);
        project.markModified('collections');
        await project.save();

        logger.info(`Updated record ${id} in ${projectPath}/${collection}`);
        res.json(records[index]);
    } catch (error) {
        logger.error(`Error in updateRecord: ${error.message}`);
        next(error);
    }
};

/**
 * @desc    Delete a record by _id
 * @route   DELETE /mock/:projectPath/:collection/:id
 */
exports.deleteRecord = async (req, res, next) => {
    try {
        const { projectPath, collection, id } = req.params;

        const project = await Project.findOne({ basePath: projectPath });
        if (!project) {
            logger.warn(`Project not found: ${projectPath}`);
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        const records = project.collections.get(collection);
        if (!records) {
            logger.warn(`Collection not found: ${collection} in project ${projectPath}`);
            return res.status(404).json({ success: false, error: `Collection "${collection}" not found` });
        }

        const index = records.findIndex((r) => r._id === id);
        if (index === -1) {
            logger.warn(`Record not found for delete: ${id} in ${projectPath}/${collection}`);
            return res.status(404).json({ success: false, error: 'Record not found' });
        }

        records.splice(index, 1);

        project.collections.set(collection, records);
        project.markModified('collections');
        await project.save();

        logger.info(`Deleted record ${id} from ${projectPath}/${collection}`);
        res.json({ success: true, data: {} });
    } catch (error) {
        logger.error(`Error in deleteRecord: ${error.message}`);
        next(error);
    }
};
