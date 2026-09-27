const { Settings } = require('../models/settings.model');
const { RecentChange } = require('../models/change.model');
const { AppError } = require('../utils/response');

const DEFAULT_SETTINGS = {
  publicContactEmail: 'admin@lmcs.com',
  publicPhone: '+1 (555) 019-2837',
  websiteName: 'LMCS Corporate Portal',
  websiteStatus: 'Active',
};

const initSettings = async () => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(DEFAULT_SETTINGS);
      console.log('[Settings Init] Initialized default settings.');
    }
    return settings;
  } catch (error) {
    console.error('[Settings Init] Failed to initialize settings:', error.message);
  }
};

const getSettings = async () => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await initSettings();
  }
  return settings;
};

const getPublicSettings = async () => {
  const settings = await getSettings();
  return {
    publicContactEmail: settings?.publicContactEmail || 'admin@lmcs.com',
    publicPhone: settings?.publicPhone || '+1 (555) 019-2837',
    websiteName: settings?.websiteName || 'LMCS Corporate Portal',
    websiteStatus: settings?.websiteStatus || 'Active',
  };
};

const updateSettings = async (data, user = {}) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create(DEFAULT_SETTINGS);
  }

  const { publicContactEmail, publicPhone } = data;

  if (publicContactEmail !== undefined) {
    const trimmed = String(publicContactEmail).trim();
    if (!trimmed) {
      throw new AppError('Public contact email is required', 400, 'INVALID_EMAIL');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      throw new AppError('Enter a valid email address', 400, 'INVALID_EMAIL');
    }
    settings.publicContactEmail = trimmed;
  }

  if (publicPhone !== undefined) {
    const trimmedPhone = String(publicPhone).trim();
    if (!trimmedPhone) {
      throw new AppError('Public phone is required', 400, 'INVALID_PHONE');
    }
    settings.publicPhone = trimmedPhone;
  }

  await settings.save();

  // Log recent change
  const updater = user.email || 'Atlas Admin';
  await RecentChange.create({
    title: 'Public Contact Information',
    type: 'Page',
    status: 'published',
    action: 'Updated',
    summary: `Updated public contact info: ${settings.publicContactEmail}, ${settings.publicPhone}`,
    updatedBy: updater,
  });

  return settings;
};

module.exports = {
  initSettings,
  getSettings,
  getPublicSettings,
  updateSettings,
};
