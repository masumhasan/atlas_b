const cloudinary = require('cloudinary').v2;
const env = require('./env');

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

const ROOT_FOLDER = 'lmcsatlas';

/**
 * Standardized folder structure for Cloudinary assets.
 * All project assets reside under the 'lmcsatlas/' namespace.
 */
const CLOUDINARY_FOLDERS = Object.freeze({
  ROOT: ROOT_FOLDER,
  PAGES: `${ROOT_FOLDER}/pages`,
  INSIGHTS: `${ROOT_FOLDER}/insights`,
  AVATARS: `${ROOT_FOLDER}/avatars`,
  LEGAL: `${ROOT_FOLDER}/legal`,
  MEDIA: `${ROOT_FOLDER}/media`,
  INQUIRIES: `${ROOT_FOLDER}/inquiries`,
  BRANDING: `${ROOT_FOLDER}/branding`,
  SETTINGS: `${ROOT_FOLDER}/settings`,
});

/**
 * Enforces that every upload target is strictly routed under 'lmcsatlas/'.
 * Sanitizes input path and prevents directory traversal or outside folder targets.
 *
 * @param {string} [subfolder='media'] - Requested subfolder path
 * @returns {string} Safe normalized folder path inside 'lmcsatlas'
 */
const resolveFolder = (subfolder = 'media') => {
  if (!subfolder || typeof subfolder !== 'string' || subfolder.trim() === '') {
    return CLOUDINARY_FOLDERS.MEDIA;
  }

  // Strip directory traversal, normalize consecutive and outer slashes
  const sanitized = subfolder
    .trim()
    .replace(/\.\./g, '')
    .replace(/^\/+|\/+$/g, '')
    .replace(/\/+/g, '/');

  if (sanitized === '' || sanitized === ROOT_FOLDER) {
    return ROOT_FOLDER;
  }

  // If already prefixed with lmcsatlas/
  if (sanitized.startsWith(`${ROOT_FOLDER}/`)) {
    return sanitized;
  }

  return `${ROOT_FOLDER}/${sanitized}`;
};

module.exports = {
  cloudinary,
  ROOT_FOLDER,
  CLOUDINARY_FOLDERS,
  resolveFolder,
};
