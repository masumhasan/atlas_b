const { User } = require('../models/user.model');
const { generateToken } = require('../utils/jwt');
const { AppError } = require('../utils/response');
const env = require('../config/env');

/**
 * Initializes the default admin user if one does not already exist.
 * Safe to run multiple times without overwriting existing data.
 */
const initAdminAccount = async () => {
  try {
    const existingAdmin = await User.findOne({ email: env.ADMIN_EMAIL }).select('+password');

    if (existingAdmin) {
      // Ensure password in database matches ADMIN_PASS in .env
      const isPasswordMatch = await existingAdmin.comparePassword(env.ADMIN_PASS);
      if (!isPasswordMatch) {
        existingAdmin.password = env.ADMIN_PASS;
        await existingAdmin.save();
        console.log(`[Admin Init] Admin account password synchronized with ADMIN_PASS.`);
      } else {
        console.log(`[Admin Init] Admin account (${env.ADMIN_EMAIL}) already exists and is up to date.`);
      }
      return existingAdmin;
    }

    const admin = await User.create({
      email: env.ADMIN_EMAIL,
      password: env.ADMIN_PASS,
      role: 'admin',
    });

    console.log(`[Admin Init] Initial admin account (${env.ADMIN_EMAIL}) created successfully.`);
    return admin;
  } catch (error) {
    console.error('[Admin Init] Error initializing admin account:', error.message);
    throw error;
  }
};

/**
 * Authenticates a user with email and password.
 * Strictly permits only the configured admin user.
 */
const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Strictly enforce that only the configured ADMIN_EMAIL is permitted to log in
  if (normalizedEmail !== env.ADMIN_EMAIL) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  // Find user and explicitly include password field which is unselected by default
  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  if (!user || user.role !== 'admin') {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const tokenPayload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  const token = generateToken(tokenPayload);

  return {
    user: {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    token,
  };
};

/**
 * Retrieves the profile of an authenticated user by ID.
 */
const getUserProfile = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  };
};

module.exports = {
  initAdminAccount,
  loginUser,
  getUserProfile,
};
