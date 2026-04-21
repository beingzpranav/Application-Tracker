const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken, protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadToR2, deleteFromR2 } = require('../config/cloudflare');

const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// @route   GET /api/auth/google
// @desc    Start Google OAuth flow
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${FRONTEND_URL}/login?error=auth_failed`,
    session: false,
  }),
  (req, res) => {
    // Generate JWT and redirect to frontend with token
    const token = generateToken(req.user);
    res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

// @route   GET /api/auth/me
// @desc    Get current user info
router.get('/me', protect, (req, res) => {
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    username: req.user.username,
    avatar: req.user.avatar,
  });
});

// @route   POST /api/auth/register
// @desc    Register a local user
router.post('/register', async (req, res) => {
  try {
    const { name, email, username, password } = req.body;
    if (!name || !email || !username || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'User with that email or username already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      username,
      password: hashedPassword,
    });

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      token: generateToken(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login a local user
router.post('/login', async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;
    if (!usernameOrEmail || !password) {
      return res.status(400).json({ message: 'Please provide username/email and password' });
    }

    const user = await User.findOne({
      $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }]
    });

    if (user && user.password && (await bcrypt.compare(password, user.password))) {
      res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        token: generateToken(user),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = req.body.name || user.name;
    
    // Check username uniqueness if changing
    if (req.body.username && req.body.username !== user.username) {
      const existing = await User.findOne({ username: req.body.username });
      if (existing) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
      user.username = req.body.username;
    }

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();
    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      username: updatedUser.username,
      avatar: updatedUser.avatar,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/avatar
// @desc    Upload profile photo
router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image file' });
    }

    const user = await User.findById(req.user._id);
    if (user.avatar && user.avatar.includes('r2.cloudflarestorage.com')) {
      // Try deleting old avatar if it was uploaded to R2
      try { await deleteFromR2(user.avatar); } catch (e) { /* ignore */ }
    }

    const filename = `avatar_${user._id}_${Date.now()}`;
    const result = await uploadToR2(req.file.buffer, filename, req.file.mimetype);
    user.avatar = result.url;
    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
