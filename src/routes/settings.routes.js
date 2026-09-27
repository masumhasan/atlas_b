const express = require('express');
const settingsController = require('../controllers/settings.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');

const router = express.Router();

// Public route for website
router.get('/public', settingsController.getPublicSettings);

// Settings for dashboard
router.get('/', settingsController.getSettings);

// Protected routes for updating settings
router.put('/', authMiddleware, authorizeRoles('admin'), settingsController.updateSettings);
router.patch('/', authMiddleware, authorizeRoles('admin'), settingsController.updateSettings);

module.exports = router;
