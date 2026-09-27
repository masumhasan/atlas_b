const express = require('express');
const pageController = require('../controllers/page.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');

const router = express.Router();

// Public routes (Used by atlas_web and public queries)
router.get('/', pageController.getPages);
router.get('/public', (req, res, next) => {
  req.query.public = 'true';
  pageController.getPages(req, res, next);
});
router.get('/:id', pageController.getPageById);

// Protected admin routes (Used by atlas_d to manage pages)
router.put('/:id', authMiddleware, authorizeRoles('admin'), pageController.updatePage);
router.patch('/:id/visibility', authMiddleware, authorizeRoles('admin'), pageController.toggleVisibility);

module.exports = router;
