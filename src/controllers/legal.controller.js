const legalService = require('../services/legal.service');
const { sendSuccess } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const docs = await legalService.getAllLegalDocs();
    return sendSuccess(res, {
      statusCode: 200,
      message: 'Legal documents retrieved successfully',
      data: docs,
    });
  } catch (error) {
    next(error);
  }
};

const getPublic = async (req, res, next) => {
  try {
    const docs = await legalService.getPublicLegalDocs();
    return sendSuccess(res, {
      statusCode: 200,
      message: 'Public legal documents retrieved successfully',
      data: docs,
    });
  } catch (error) {
    next(error);
  }
};

const getBySlug = async (req, res, next) => {
  try {
    const doc = await legalService.getLegalDocBySlug(req.params.slug);
    return sendSuccess(res, {
      statusCode: 200,
      message: 'Legal document retrieved successfully',
      data: doc,
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const doc = await legalService.updateLegalDoc(req.params.slug, req.body, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: 'Legal document updated successfully',
      data: doc,
    });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const doc = await legalService.createLegalDoc(req.body, req.user);
    return sendSuccess(res, {
      statusCode: 201,
      message: 'Legal document created successfully',
      data: doc,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getPublic,
  getBySlug,
  update,
  create,
};
