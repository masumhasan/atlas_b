const authService = require('../services/auth.service');
const { sendSuccess } = require('../utils/response');

/**
 * Handle admin/user login
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user profile
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const userProfile = await authService.getUserProfile(req.user._id);

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Current user retrieved successfully',
      data: userProfile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle user logout (stateless JWT client-side token discard)
 * POST /api/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    return sendSuccess(res, {
      statusCode: 200,
      message: 'Logout successful. Please remove stored authentication token on the client.',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getMe,
  logout,
};
