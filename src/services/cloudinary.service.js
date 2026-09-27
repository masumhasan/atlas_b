const streamifier = require('stream');
const { cloudinary, CLOUDINARY_FOLDERS, resolveFolder } = require('../config/cloudinary');
const { AppError } = require('../utils/response');

/**
 * Initializes and creates the official folder structure in Cloudinary.
 */
const initFolderStructure = async () => {
  const folders = [
    CLOUDINARY_FOLDERS.PAGES,
    CLOUDINARY_FOLDERS.INSIGHTS,
    CLOUDINARY_FOLDERS.AVATARS,
    CLOUDINARY_FOLDERS.LEGAL,
    CLOUDINARY_FOLDERS.MEDIA,
    CLOUDINARY_FOLDERS.INQUIRIES,
    CLOUDINARY_FOLDERS.BRANDING,
    CLOUDINARY_FOLDERS.SETTINGS,
  ];

  const results = [];
  for (const folder of folders) {
    try {
      const res = await cloudinary.api.create_folder(folder);
      results.push({ folder, status: 'created', success: res.success });
    } catch (err) {
      // If folder already exists, Cloudinary returns 400 or exists message, which is fine
      results.push({ folder, status: 'exists_or_ready' });
    }
  }

  console.log(`[Cloudinary] Project folder structure initialized under /${CLOUDINARY_FOLDERS.ROOT}/`);
  return results;
};

/**
 * Upload an image (base64 string or file path) into lmcsatlas/<folder>.
 */
const uploadImage = async (fileInput, options = {}) => {
  try {
    const targetFolder = resolveFolder(options.folder);

    const uploadOptions = {
      ...options,
      folder: targetFolder,
      resource_type: 'image',
      overwrite: options.overwrite ?? true,
    };

    if (options.publicId) {
      uploadOptions.public_id = options.publicId;
    }

    const result = await cloudinary.uploader.upload(fileInput, uploadOptions);

    return {
      publicId: result.public_id,
      url: result.secure_url,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      folder: result.folder || targetFolder,
    };
  } catch (error) {
    console.error('[Cloudinary] Upload failed:', error.message);
    throw new AppError(`Image upload failed: ${error.message}`, 500, 'CLOUDINARY_UPLOAD_ERROR');
  }
};

/**
 * Upload a file from a memory buffer (e.g. from multer).
 */
const uploadBuffer = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const targetFolder = resolveFolder(options.folder);

    const uploadOptions = {
      ...options,
      folder: targetFolder,
      resource_type: 'image',
    };

    const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) {
        return reject(
          new AppError(`Buffer upload failed: ${error.message}`, 500, 'CLOUDINARY_UPLOAD_ERROR')
        );
      }
      resolve({
        publicId: result.public_id,
        url: result.secure_url,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        folder: result.folder || targetFolder,
      });
    });

    const readable = new streamifier.Readable();
    readable._read = () => {};
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

/**
 * Delete an image by its Cloudinary public ID.
 */
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error(`[Cloudinary] Deletion failed for ${publicId}:`, error.message);
    throw new AppError(`Image deletion failed: ${error.message}`, 500, 'CLOUDINARY_DELETE_ERROR');
  }
};

module.exports = {
  CLOUDINARY_FOLDERS,
  resolveFolder,
  initFolderStructure,
  uploadImage,
  uploadBuffer,
  deleteImage,
};
