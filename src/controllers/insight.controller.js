const insightService = require('../services/insight.service');
const { sendSuccess } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const result = await insightService.getAllInsights(req.query);
    return sendSuccess(res, {
      statusCode: 200,
      message: 'Insights retrieved successfully',
      data: result.insights,
      meta: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getPublic = async (req, res, next) => {
  try {
    const insights = await insightService.getPublicInsights();
    return sendSuccess(res, {
      statusCode: 200,
      message: 'Public insights retrieved successfully',
      data: insights,
    });
  } catch (error) {
    next(error);
  }
};

const getOne = async (req, res, next) => {
  try {
    const insight = await insightService.getInsightByIdOrSlug(req.params.idOrSlug);
    return sendSuccess(res, {
      statusCode: 200,
      message: 'Insight retrieved successfully',
      data: insight,
    });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const insight = await insightService.createInsight(req.body, req.user);
    return sendSuccess(res, {
      statusCode: 201,
      message: 'Insight created successfully',
      data: insight,
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const insight = await insightService.updateInsight(req.params.id, req.body, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: 'Insight updated successfully',
      data: insight,
    });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await insightService.deleteInsight(req.params.id, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: result.message,
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getPublic,
  getOne,
  create,
  update,
  remove,
};
