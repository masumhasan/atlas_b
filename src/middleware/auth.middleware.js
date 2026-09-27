const { verifyToken } = require('../utils/jwt');
const { AppError } = require('../utils/response');
const { User } = require('../models/user.model');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(
        new AppError('Authentication token missing or invalid format', 401, 'UNAUTHORIZED')
      );
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return next(
        new AppError('Authentication token missing', 401, 'UNAUTHORIZED')
      );
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(
          new AppError('Token has expired. Please log in again.', 401, 'TOKEN_EXPIRED')
        );
      }
      return next(
        new AppError('Invalid authentication token', 401, 'INVALID_TOKEN')
      );
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return next(
        new AppError('User belonging to this token no longer exists', 401, 'USER_NOT_FOUND')
      );
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authMiddleware,
};
