const express = require('express');
const insightController = require('../controllers/insight.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');

const router = express.Router();

// Public routes for website and general queries
router.get('/public', insightController.getPublic);
router.get('/', insightController.getAll);
router.get('/:idOrSlug', insightController.getOne);

// Protected admin routes
router.post(
  '/',
  authMiddleware,
  authorizeRoles('admin'),
  insightController.create
);

router.put(
  '/:id',
  authMiddleware,
  authorizeRoles('admin'),
  insightController.update
);

router.delete(
  '/:id',
  authMiddleware,
  authorizeRoles('admin'),
  insightController.remove
);

module.exports = router;
