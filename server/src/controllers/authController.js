const User = require('../models/User');
const { ApiError } = require('../middleware/errorHandler');

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 * @param   {import('express').Request} req
 * @param   {import('express').Response} res
 * @param   {import('express').NextFunction} next
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ApiError('Please provide both email and password', 400));
    }

    // Check for user and explicitly include password field
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return next(new ApiError('Invalid email or password', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new ApiError('Invalid email or password', 401));
    }

    // Create token
    const token = user.getSignedJwtToken();

    const userData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email
    };

    return res.status(200).json({
      success: true,
      token,
      user: userData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user details
 * @route   GET /api/auth/me
 * @access  Private
 * @param   {import('express').Request} req
 * @param   {import('express').Response} res
 * @param   {import('express').NextFunction} next
 */
const getMe = async (req, res, next) => {
  try {
    // req.user was populated by authMiddleware
    const userData = {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    };

    return res.status(200).json({
      success: true,
      id: userData.id,
      name: userData.name,
      email: userData.email,
      user: userData
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getMe
};
