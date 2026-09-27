class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_SERVER_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const sendSuccess = (res, { statusCode = 200, message = 'Operation successful', data = {}, meta = undefined }) => {
  const payload = {
    success: true,
    message,
    data,
  };
  if (meta !== undefined) {
    payload.meta = meta;
  }
  return res.status(statusCode).json(payload);
};

const sendError = (res, { statusCode = 500, message = 'Something went wrong', code = 'INTERNAL_ERROR', details = null }) => {
  const payload = {
    success: false,
    message,
    error: {
      code,
    },
  };

  if (details) {
    payload.error.details = details;
  }

  return res.status(statusCode).json(payload);
};

module.exports = {
  AppError,
  sendSuccess,
  sendError,
};
