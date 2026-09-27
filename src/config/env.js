const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load .env only when the file exists (local dev). In Vercel, env vars come from platform.
const envPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

// Helper: get and trim env var (removes \r\n from shell-piped values)
const getEnv = (key) => (process.env[key] || '').replace(/[\r\n]+$/, '').trim();

const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'ADMIN_EMAIL', 'ADMIN_PASS'];

const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);
if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variable(s): ${missingEnvVars.join(', ')}. Please check your .env file.`
  );
}

const parseCorsOrigins = (originsStr) => {
  if (!originsStr || originsStr.trim() === '') {
    return ['http://localhost:3000', 'http://localhost:3001'];
  }
  return originsStr.split(',').map((origin) => origin.trim()).filter(Boolean);
};

const env = Object.freeze({
  NODE_ENV: getEnv('NODE_ENV') || 'development',
  PORT: parseInt(getEnv('PORT') || '5000', 10),
  MONGODB_URI: getEnv('MONGODB_URI'),
  JWT_SECRET: getEnv('JWT_SECRET'),
  JWT_EXPIRES_IN: getEnv('JWT_EXPIRES_IN') || '7d',
  ADMIN_EMAIL: (getEnv('ADMIN_EMAIL') || '').toLowerCase(),
  ADMIN_PASS: getEnv('ADMIN_PASS'),
  CORS_ORIGINS: parseCorsOrigins(getEnv('CORS_ORIGINS')),
  CLOUDINARY_CLOUD_NAME: getEnv('CLOUDINARY_CLOUD_NAME'),
  CLOUDINARY_API_KEY: getEnv('CLOUDINARY_API_KEY'),
  CLOUDINARY_API_SECRET: getEnv('CLOUDINARY_API_SECRET'),
});

module.exports = env;
