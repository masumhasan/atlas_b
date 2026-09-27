const { AppError } = require('../utils/response');

const validate = (schema, target = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const details = result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      const primaryMessage = details[0]?.message || 'Validation error';

      return next(new AppError(primaryMessage, 400, 'VALIDATION_ERROR', details));
    }

    req[target] = result.data;
    next();
  };
};

module.exports = {
  validate,
};
