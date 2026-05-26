const express = require('express');
const router = express.Router();
const apiKeyAuth = require('../middleware/apiKeyAuth');
const {
    getRecords,
    createRecord,
    updateRecord,
    deleteRecord,
} = require('../controllers/mockController');

// All mock routes require API key authentication
// URL pattern: /api/:apiKey/:collection[/:id]
// The apiKeyAuth middleware validates the key, checks rate limits,
// and attaches req.project before reaching the controller.

router.get('/:apiKey/:collection', apiKeyAuth, getRecords);
router.get('/:apiKey/:collection/:id', apiKeyAuth, getRecords);
router.post('/:apiKey/:collection', apiKeyAuth, createRecord);
router.put('/:apiKey/:collection/:id', apiKeyAuth, updateRecord);
router.delete('/:apiKey/:collection/:id', apiKeyAuth, deleteRecord);

module.exports = router;
