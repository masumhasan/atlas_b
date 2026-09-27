const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const env = require('./config/env');
const routes = require('./routes');
const { notFoundMiddleware } = require('./middleware/notFound.middleware');
const { errorMiddleware } = require('./middleware/error.middleware');
const { AppError } = require('./utils/response');

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration supporting atlas_web, atlas_d and configured origins
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. server-to-server, curl, Postman)
    if (!origin) return callback(null, true);

    if (env.CORS_ORIGINS.includes('*') || env.CORS_ORIGINS.includes(origin)) {
      return callback(null, true);
    }

    return callback(new AppError(`Origin '${origin}' not allowed by CORS policy`, 403, 'CORS_ERROR'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Request body size limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// HTTP request logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Mount API routes
app.use('/api', routes);

// 404 Route Not Found handler
app.use(notFoundMiddleware);

// Centralized Error handler
app.use(errorMiddleware);

module.exports = app;
