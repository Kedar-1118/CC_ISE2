const Project = require('../models/Project');
const RequestLog = require('../models/RequestLog');
const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger');

const MAX_PROJECTS_PER_USER = 3;

/**
 * @desc    Create a new mock API project
 * @route   POST /api/projects
 */
exports.createProject = async (req, res, next) => {
    try {
        const { projectName, jsonData } = req.body;

        if (!projectName || !jsonData) {
            logger.warn('Create project failed: missing projectName or jsonData');
            return res.status(400).json({
                success: false,
                error: 'projectName and jsonData are required',
            });
        }

        // Enforce per-user project limit
        const projectCount = await Project.countDocuments({ owner: req.user._id });
        if (projectCount >= MAX_PROJECTS_PER_USER) {
            logger.warn(`Project limit reached for user ${req.user.email} (${projectCount}/${MAX_PROJECTS_PER_USER})`);
            return res.status(403).json({
                success: false,
                error: `You can create a maximum of ${MAX_PROJECTS_PER_USER} projects. Please delete an existing project to create a new one.`,
            });
        }

        // Validate jsonData is a non-null object
        if (typeof jsonData !== 'object' || Array.isArray(jsonData) || jsonData === null) {
            logger.warn(`Create project failed: invalid jsonData format for "${projectName}"`);
            return res.status(400).json({
                success: false,
                error: 'jsonData must be a JSON object where each key is a collection name and value is an array of records',
            });
        }

        // Validate each collection value is an array
        const collections = new Map();
        for (const [key, value] of Object.entries(jsonData)) {
            if (!Array.isArray(value)) {
                logger.warn(`Create project failed: collection "${key}" is not an array`);
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

        // Generate unique API key
        const apiKey = uuidv4();

        const project = await Project.create({
            projectName,
            collections,
            owner: req.user._id,
            apiKey,
            weeklyRateLimit: {
                requestCount: 0,
                weekStart: new Date(),
                limit: parseInt(process.env.WEEKLY_RATE_LIMIT) || 500,
            },
        });

        logger.info(`Project created: "${projectName}" (${project._id}) by ${req.user.email} with API key ${apiKey.substring(0, 8)}... and ${collections.size} collections`);
        res.status(201).json({
            success: true,
            data: {
                id: project._id,
                projectName: project.projectName,
                basePath: project.basePath,
                apiKey: project.apiKey,
                collections: Object.fromEntries(project.collections),
                weeklyRateLimit: project.weeklyRateLimit,
                createdAt: project.createdAt,
            },
        });
    } catch (error) {
        // Handle duplicate key error
        if (error.code === 11000) {
            logger.warn(`Duplicate project name: "${req.body.projectName}"`);
            return res.status(409).json({
                success: false,
                error: 'A project with that name already exists',
            });
        }
        logger.error(`Error in createProject: ${error.message}`);
        next(error);
    }
};

/**
 * @desc    Get all projects for the authenticated user (summary list)
 * @route   GET /api/projects
 */
exports.getAllProjects = async (req, res, next) => {
    try {
        // Only return projects owned by the authenticated user
        const projects = await Project.find({ owner: req.user._id }).sort({ createdAt: -1 });

        const data = projects.map((p) => ({
            id: p._id,
            projectName: p.projectName,
            basePath: p.basePath,
            apiKey: p.apiKey,
            collectionNames: [...p.collections.keys()],
            collectionCount: p.collections.size,
            weeklyRateLimit: p.weeklyRateLimit,
            createdAt: p.createdAt,
        }));

        logger.info(`Fetched ${data.length} projects for user ${req.user.email}`);
        res.json({ success: true, count: data.length, data });
    } catch (error) {
        logger.error(`Error in getAllProjects: ${error.message}`);
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
            logger.warn(`Project not found: ${req.params.id}`);
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        // Verify ownership
        if (project.owner.toString() !== req.user._id.toString()) {
            logger.warn(`Unauthorized access to project ${req.params.id} by user ${req.user._id}`);
            return res.status(403).json({ success: false, error: 'Not authorized to access this project' });
        }

        logger.info(`Fetched project: "${project.projectName}" (${project._id})`);
        res.json({
            success: true,
            data: {
                id: project._id,
                projectName: project.projectName,
                basePath: project.basePath,
                apiKey: project.apiKey,
                collections: Object.fromEntries(project.collections),
                weeklyRateLimit: project.weeklyRateLimit,
                createdAt: project.createdAt,
            },
        });
    } catch (error) {
        logger.error(`Error in getProject: ${error.message}`);
        next(error);
    }
};

/**
 * @desc    Delete a project and its associated logs
 * @route   DELETE /api/projects/:id
 */
exports.deleteProject = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            logger.warn(`Delete failed - project not found: ${req.params.id}`);
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        // Verify ownership
        if (project.owner.toString() !== req.user._id.toString()) {
            logger.warn(`Unauthorized delete of project ${req.params.id} by user ${req.user._id}`);
            return res.status(403).json({ success: false, error: 'Not authorized to delete this project' });
        }

        await Project.findByIdAndDelete(req.params.id);

        // Also delete related request logs
        await RequestLog.deleteMany({ projectId: req.params.id });

        logger.info(`Deleted project: "${project.projectName}" (${req.params.id}) and its logs`);
        res.json({ success: true, data: {} });
    } catch (error) {
        logger.error(`Error in deleteProject: ${error.message}`);
        next(error);
    }
};
