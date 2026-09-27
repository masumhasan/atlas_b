const express = require('express');
const legalController = require('../controllers/legal.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');

const router = express.Router();

// Public routes for website frontend and public reading
router.get('/public', legalController.getPublic);
router.get('/public/:slug', legalController.getBySlug);

// Dashboard routes: list and get single document
router.get('/', legalController.getAll);
router.get('/:slug', legalController.getBySlug);

// Protected mutation routes
router.put('/:slug', authMiddleware, authorizeRoles('admin'), legalController.update);
router.post('/', authMiddleware, authorizeRoles('admin'), legalController.create);

module.exports = router;
