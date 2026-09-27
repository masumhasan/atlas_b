const dashboardService = require('../services/dashboard.service');
const { sendSuccess } = require('../utils/response');

const getStats = async (req, res, next) => {
  try {
    const data = await dashboardService.getDashboardStats();
    return sendSuccess(res, {
      statusCode: 200,
      message: 'Dashboard statistics retrieved successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
};
