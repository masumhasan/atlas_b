const settingsService = require('../services/settings.service');
const { sendSuccess } = require('../utils/response');

const getSettings = async (req, res, next) => {
  try {
    const settings = await settingsService.getSettings();
    return sendSuccess(res, {
      statusCode: 200,
      message: 'Settings retrieved successfully',
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

const getPublicSettings = async (req, res, next) => {
  try {
    const publicSettings = await settingsService.getPublicSettings();
    return sendSuccess(res, {
      statusCode: 200,
      message: 'Public settings retrieved successfully',
      data: publicSettings,
    });
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const updated = await settingsService.updateSettings(req.body, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: 'Settings updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  getPublicSettings,
  updateSettings,
};
