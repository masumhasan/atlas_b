const pageService = require('../services/page.service');
const { sendSuccess } = require('../utils/response');

const getPages = async (req, res, next) => {
  try {
    const isPublic = req.query.public === 'true';
    const pages = isPublic
      ? await pageService.getPublicPages()
      : await pageService.getAllPages();

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Pages retrieved successfully',
      data: pages,
    });
  } catch (error) {
    next(error);
  }
};

const getPageById = async (req, res, next) => {
  try {
    const page = await pageService.getPageById(req.params.id);
    return sendSuccess(res, {
      statusCode: 200,
      message: 'Page retrieved successfully',
      data: page,
    });
  } catch (error) {
    next(error);
  }
};

const updatePage = async (req, res, next) => {
  try {
    const { name, route, visibility } = req.body;
    const updatedPage = await pageService.updatePage(
      req.params.id,
      { name, route, visibility },
      req.user
    );

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Page updated successfully',
      data: updatedPage,
    });
  } catch (error) {
    next(error);
  }
};

const toggleVisibility = async (req, res, next) => {
  try {
    const { visibility } = req.body;
    const updatedPage = await pageService.togglePageVisibility(
      req.params.id,
      visibility,
      req.user
    );

    return sendSuccess(res, {
      statusCode: 200,
      message: `Page visibility updated to ${visibility}`,
      data: updatedPage,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPages,
  getPageById,
  updatePage,
  toggleVisibility,
};
