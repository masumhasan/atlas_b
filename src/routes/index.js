const express = require('express');
const authRoutes = require('./auth.routes');
const healthRoutes = require('./health.routes');
const pageRoutes = require('./page.routes');
const dashboardRoutes = require('./dashboard.routes');
const mediaRoutes = require('./media.routes');
const insightRoutes = require('./insight.routes');
const legalRoutes = require('./legal.routes');
const inquiryRoutes = require('./inquiry.routes');
const settingsRoutes = require('./settings.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/health', healthRoutes);
router.use('/pages', pageRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/media', mediaRoutes);
router.use('/insights', insightRoutes);
router.use('/legal', legalRoutes);
router.use('/inquiries', inquiryRoutes);
router.use('/settings', settingsRoutes);

module.exports = router;

