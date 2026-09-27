const inquiryService = require('../services/inquiry.service');
const { sendSuccess } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const result = await inquiryService.getInquiries(req.query);
    return sendSuccess(res, {
      statusCode: 200,
      message: 'Inquiries retrieved successfully',
      data: result.inquiries,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        counts: result.counts,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getOne = async (req, res, next) => {
  try {
    const inquiry = await inquiryService.getInquiryById(req.params.id);
    return sendSuccess(res, {
      statusCode: 200,
      message: 'Inquiry retrieved successfully',
      data: inquiry,
    });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const inquiry = await inquiryService.createInquiry(req.body);
    return sendSuccess(res, {
      statusCode: 201,
      message: 'Inquiry submitted successfully. We will be in touch shortly.',
      data: inquiry,
    });
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const inquiry = await inquiryService.updateInquiryStatus(
      req.params.id,
      req.body.status,
      req.user
    );
    return sendSuccess(res, {
      statusCode: 200,
      message: `Inquiry status updated to ${inquiry.status}`,
      data: inquiry,
    });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await inquiryService.deleteInquiry(req.params.id);
    return sendSuccess(res, {
      statusCode: 200,
      message: 'Inquiry deleted successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getOne,
  create,
  updateStatus,
  remove,
};
