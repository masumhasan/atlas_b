const cloudinaryService = require('../services/cloudinary.service');
const { sendSuccess, AppError } = require('../utils/response');

/**
 * Handle image upload into lmcsatlas/<folder>
 * POST /api/media/upload
 */
const upload = async (req, res, next) => {
  try {
    const targetFolder = req.body.folder || req.query.folder || 'media';

    // If file provided via multer memory buffer
    if (req.file) {
      const result = await cloudinaryService.uploadBuffer(req.file.buffer, {
        folder: targetFolder,
      });

      return sendSuccess(res, {
        statusCode: 201,
        message: 'Image uploaded successfully to Cloudinary',
        data: result,
      });
    }

    // If file provided via base64 or URL in request body
    if (req.body.image || req.body.file) {
      const fileInput = req.body.image || req.body.file;
      const result = await cloudinaryService.uploadImage(fileInput, {
        folder: targetFolder,
        publicId: req.body.publicId,
      });

      return sendSuccess(res, {
        statusCode: 201,
        message: 'Image uploaded successfully to Cloudinary',
        data: result,
      });
    }

    throw new AppError('No image file or base64 data provided in request', 400, 'NO_IMAGE_PROVIDED');
  } catch (error) {
    next(error);
  }
};

/**
 * Handle image deletion from Cloudinary
 * DELETE /api/media
 */
const remove = async (req, res, next) => {
  try {
    const publicId = req.body.publicId || req.query.publicId;
    if (!publicId) {
      throw new AppError('publicId is required for deletion', 400, 'PUBLIC_ID_REQUIRED');
    }

    const result = await cloudinaryService.deleteImage(publicId);

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Image deleted successfully from Cloudinary',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get the standardized folder hierarchy for the project
 * GET /api/media/folders
 */
const getFolders = (req, res) => {
  return sendSuccess(res, {
    statusCode: 200,
    message: 'Cloudinary folder structure retrieved successfully',
    data: cloudinaryService.CLOUDINARY_FOLDERS,
  });
};

module.exports = {
  upload,
  remove,
  getFolders,
};
