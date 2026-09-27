const app = require('./app');
const env = require('./config/env');
const { connectDB, disconnectDB } = require('./config/database');
const { initAdminAccount } = require('./services/auth.service');
const { initPages } = require('./services/page.service');
const { initInsights } = require('./services/insight.service');
const { initLegalDocuments } = require('./services/legal.service');
const { initInquiries } = require('./services/inquiry.service');
const { initSettings } = require('./services/settings.service');
const { initFolderStructure } = require('./services/cloudinary.service');

let server;

const startServer = async () => {
  try {
    // 1. Establish database connection
    await connectDB();

    // 2. Initialize default admin user idempotently
    await initAdminAccount();

    // 3. Initialize default pages and content change logs idempotently
    await initPages();

    // 4. Initialize canonical insights idempotently
    await initInsights();

    // 5. Initialize canonical legal documents idempotently
    await initLegalDocuments();

    // 6. Initialize default inquiries idempotently
    await initInquiries();

    // 7. Initialize default settings idempotently
    await initSettings();

    // 8. Initialize Cloudinary folder structure under /lmcsatlas/

    try {
      await initFolderStructure();
    } catch (cloudErr) {
      console.warn('[Cloudinary] Folder structure check warning:', cloudErr.message);
    }

    // 5. Start HTTP server after dependencies are initialized
    server = app.listen(env.PORT, () => {
      console.log(`[Server] Atlas backend running in ${env.NODE_ENV} mode on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error('[Server] Failed to start application:', error.message);
    process.exit(1);
  }
};

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`[Server] ${signal} signal received. Initiating graceful shutdown...`);
  if (server) {
    server.close(async () => {
      console.log('[Server] HTTP server closed.');
      await disconnectDB();
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Process] Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[Process] Uncaught Exception:', error);
  process.exit(1);
});

startServer();
