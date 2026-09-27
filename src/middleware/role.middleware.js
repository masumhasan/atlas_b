const { AppError } = require('../utils/response');

/**
 * Middleware factory to authorize access based on user roles.
 * Supports multiple roles (e.g. authorizeRoles('admin', 'manager')).
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new AppError('Authentication required before authorization check', 401, 'UNAUTHORIZED')
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Forbidden: Role '${req.user.role}' is not authorized to access this resource`,
          403,
          'FORBIDDEN'
        )
      );
    }

    next();
  };
};

module.exports = {
  authorizeRoles,
};
