const express = require('express');
const inquiryController = require('../controllers/inquiry.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');

const router = express.Router();

// Public submission route from the website frontend contact page
router.post('/', inquiryController.create);

// Protected routes for dashboard management
router.get('/', authMiddleware, authorizeRoles('admin'), inquiryController.getAll);
router.get('/:id', authMiddleware, authorizeRoles('admin'), inquiryController.getOne);
router.patch('/:id/status', authMiddleware, authorizeRoles('admin'), inquiryController.updateStatus);
router.delete('/:id', authMiddleware, authorizeRoles('admin'), inquiryController.remove);

module.exports = router;
