const express = require('express');
const multer = require('multer');
const mediaController = require('../controllers/media.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

const router = express.Router();

router.get('/folders', mediaController.getFolders);

// Protected admin endpoints
router.post(
  '/upload',
  authMiddleware,
  authorizeRoles('admin'),
  upload.single('image'),
  mediaController.upload
);

router.delete(
  '/',
  authMiddleware,
  authorizeRoles('admin'),
  mediaController.remove
);

module.exports = router;
