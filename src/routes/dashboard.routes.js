const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');

const router = express.Router();

// Protected admin routes for dashboard overview and stats
router.get('/stats', authMiddleware, authorizeRoles('admin'), dashboardController.getStats);

module.exports = router;
