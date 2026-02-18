const express = require('express');
const router = express.Router();
const {
    getRecords,
    createRecord,
    updateRecord,
    deleteRecord,
} = require('../controllers/mockController');

// Dynamic mock CRUD routes
router.get('/:projectPath/:collection', getRecords);
router.get('/:projectPath/:collection/:id', getRecords);
router.post('/:projectPath/:collection', createRecord);
router.put('/:projectPath/:collection/:id', updateRecord);
router.delete('/:projectPath/:collection/:id', deleteRecord);

module.exports = router;
