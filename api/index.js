/**
 * Vercel Serverless Entry Point
 * Bootstraps the Express app with DB connection on cold start.
 * Uses a module-level promise to ensure bootstrap runs once per container.
 */
const app = require('../src/app');
const { connectDB } = require('../src/config/database');
const { initAdminAccount } = require('../src/services/auth.service');
const { initPages } = require('../src/services/page.service');
const { initInsights } = require('../src/services/insight.service');
const { initLegalDocuments } = require('../src/services/legal.service');
const { initInquiries } = require('../src/services/inquiry.service');
const { initSettings } = require('../src/services/settings.service');

// Store bootstrap promise at module level so it only runs once per container
let bootstrapPromise = null;

const bootstrap = () => {
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = (async () => {
    await connectDB();
    await initAdminAccount();
    await initPages();
    await initInsights();
    await initLegalDocuments();
    await initInquiries();
    await initSettings();
    console.log('[Serverless] Bootstrap complete');
  })().catch((err) => {
    // Reset so next request can retry
    bootstrapPromise = null;
    throw err;
  });

  return bootstrapPromise;
};

module.exports = async (req, res) => {
  try {
    await bootstrap();
  } catch (err) {
    console.error('[Serverless] Bootstrap failed:', err.message);
    return res.status(503).json({
      success: false,
      error: 'Service temporarily unavailable. Please try again.',
      details: process.env.NODE_ENV !== 'production' ? err.message : undefined,
    });
  }
  return app(req, res);
};
