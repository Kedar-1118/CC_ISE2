const express = require('express');
const router = express.Router();
const {
    createProject,
    getAllProjects,
    getProject,
    deleteProject,
} = require('../controllers/projectController');
const { getLogsByProject } = require('../controllers/logController');

// Project CRUD
router.post('/', createProject);
router.get('/', getAllProjects);
router.get('/:id', getProject);
router.delete('/:id', deleteProject);

// Project request logs
router.get('/:id/logs', getLogsByProject);

module.exports = router;
