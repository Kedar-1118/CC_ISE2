const Project = require('../models/Project');
const { v4: uuidv4 } = require('uuid');

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
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        const records = project.collections.get(collection);
        if (!records) {
            return res.status(404).json({ success: false, error: `Collection "${collection}" not found` });
        }

        // Single record by _id
        if (id) {
            const record = records.find((r) => r._id === id);
            if (!record) {
                return res.status(404).json({ success: false, error: 'Record not found' });
            }
            return res.json(record);
        }

        // All records
        res.json(records);
    } catch (error) {
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
            return res.status(400).json({ success: false, error: 'Request body must be a JSON object' });
        }

        const project = await Project.findOne({ basePath: projectPath });
        if (!project) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        const records = project.collections.get(collection);
        if (!records) {
            return res.status(404).json({ success: false, error: `Collection "${collection}" not found` });
        }

        const newRecord = { _id: uuidv4(), ...body };
        records.push(newRecord);

        project.collections.set(collection, records);
        project.markModified('collections');
        await project.save();

        res.status(201).json(newRecord);
    } catch (error) {
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
            return res.status(400).json({ success: false, error: 'Request body must be a JSON object' });
        }

        const project = await Project.findOne({ basePath: projectPath });
        if (!project) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        const records = project.collections.get(collection);
        if (!records) {
            return res.status(404).json({ success: false, error: `Collection "${collection}" not found` });
        }

        const index = records.findIndex((r) => r._id === id);
        if (index === -1) {
            return res.status(404).json({ success: false, error: 'Record not found' });
        }

        // Merge existing record with updated fields, preserving _id
        records[index] = { ...records[index], ...body, _id: id };

        project.collections.set(collection, records);
        project.markModified('collections');
        await project.save();

        res.json(records[index]);
    } catch (error) {
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
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        const records = project.collections.get(collection);
        if (!records) {
            return res.status(404).json({ success: false, error: `Collection "${collection}" not found` });
        }

        const index = records.findIndex((r) => r._id === id);
        if (index === -1) {
            return res.status(404).json({ success: false, error: 'Record not found' });
        }

        records.splice(index, 1);

        project.collections.set(collection, records);
        project.markModified('collections');
        await project.save();

        res.json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};
