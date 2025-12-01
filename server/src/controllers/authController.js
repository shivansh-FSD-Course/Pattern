import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import Pattern from '../models/Pattern.js';

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Manual sanities
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username, email, and password',
      });
    }

    // Password format checks
    if (password.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 10 characters long',
      });
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one special character',
      });
    }

    // Check if email or username already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists',
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password, // will be hashed in pre-save
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully 🎉',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });

  } catch (error) {
    console.error('Register error:', error);

    // Handle Mongoose validation errors properly
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)[0].message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration',
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic checks
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user by email (force select password)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials ',
      });
    }

    // Compare password to hashed password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials ',
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful 🚀',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    // req.user is already populated by the protect middleware
    res.status(200).json({
      success: true,
      user: req.user,
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
// @desc    Get user profile
// @route   GET /api/auth/profile
export const getProfile = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  try {
    const { username, bio, avatar, theme } = req.body;

    // Build update object
    const updateData = {};
    if (username) updateData.username = username;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar) updateData.avatar = avatar;
    if (theme) updateData.theme = theme;

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { 
        new: true, // Return updated document
        runValidators: true // Run schema validators
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully ✨',
      user,
    });

  } catch (error) {
    console.error('Update profile error:', error);

    // Handle duplicate username error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Username already taken',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during profile update',
    });
  }
};
// @desc    Get user statistics
// @route   GET /api/auth/stats
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Count patterns created by this user (Pattern is already imported at top)
    const patternsFound = await Pattern.countDocuments({ user: userId });

    // Count total uploads (same as patterns for now)
    const totalUploads = patternsFound;

    // Calculate days active (days since account creation)
    const user = await User.findById(userId);
    const accountCreatedDate = user.createdAt;
    const today = new Date();
    const daysActive = Math.floor((today - accountCreatedDate) / (1000 * 60 * 60 * 24));

    res.json({
      success: true,
      stats: {
        patternsFound,
        daysActive,
        totalUploads
      }
    });

  } catch (error) {
    console.error('Failed to fetch user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
};