const Project = require('../models/Project');
const RequestLog = require('../models/RequestLog');
const { v4: uuidv4 } = require('uuid');

/**
 * @desc    Create a new mock API project
 * @route   POST /api/projects
 */
exports.createProject = async (req, res, next) => {
    try {
        const { projectName, jsonData } = req.body;

        if (!projectName || !jsonData) {
            return res.status(400).json({
                success: false,
                error: 'projectName and jsonData are required',
            });
        }

        // Validate jsonData is a non-null object
        if (typeof jsonData !== 'object' || Array.isArray(jsonData) || jsonData === null) {
            return res.status(400).json({
                success: false,
                error: 'jsonData must be a JSON object where each key is a collection name and value is an array of records',
            });
        }

        // Validate each collection value is an array
        const collections = new Map();
        for (const [key, value] of Object.entries(jsonData)) {
            if (!Array.isArray(value)) {
                return res.status(400).json({
                    success: false,
                    error: `Collection "${key}" must be an array of objects`,
                });
            }
            // Add auto-generated _id to each record if not present
            const records = value.map((record) => ({
                _id: uuidv4(),
                ...record,
            }));
            collections.set(key, records);
        }

        const project = await Project.create({
            projectName,
            collections,
        });

        res.status(201).json({
            success: true,
            data: {
                id: project._id,
                projectName: project.projectName,
                basePath: project.basePath,
                collections: Object.fromEntries(project.collections),
                createdAt: project.createdAt,
            },
        });
    } catch (error) {
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                error: 'A project with that name already exists',
            });
        }
        next(error);
    }
};

/**
 * @desc    Get all projects (summary list)
 * @route   GET /api/projects
 */
exports.getAllProjects = async (req, res, next) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });

        const data = projects.map((p) => ({
            id: p._id,
            projectName: p.projectName,
            basePath: p.basePath,
            collectionNames: [...p.collections.keys()],
            collectionCount: p.collections.size,
            createdAt: p.createdAt,
        }));

        res.json({ success: true, count: data.length, data });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single project with full data
 * @route   GET /api/projects/:id
 */
exports.getProject = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        res.json({
            success: true,
            data: {
                id: project._id,
                projectName: project.projectName,
                basePath: project.basePath,
                collections: Object.fromEntries(project.collections),
                createdAt: project.createdAt,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete a project and its associated logs
 * @route   DELETE /api/projects/:id
 */
exports.deleteProject = async (req, res, next) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);

        if (!project) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        // Also delete related request logs
        await RequestLog.deleteMany({ projectId: req.params.id });

        res.json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};
