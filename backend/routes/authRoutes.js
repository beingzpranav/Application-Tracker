const express = require('express');
const passport = require('passport');
const { generateToken } = require('../middleware/auth');

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
router.get('/me', (req, res) => {
  // This will be called with JWT from frontend
  const { protect } = require('../middleware/auth');
  protect(req, res, () => {
    res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
    });
  });
});

module.exports = router;
