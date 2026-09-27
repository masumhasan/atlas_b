const express = require('express');
const authController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const { loginSchema } = require('../schemas/auth.schema');

const router = express.Router();

// Public routes
router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authController.logout);

// Protected routes (Admin role authorized)
router.get('/me', authMiddleware, authorizeRoles('admin'), authController.getMe);

module.exports = router;
