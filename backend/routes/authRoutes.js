const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const { generateToken, protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadToR2, deleteFromR2 } = require('../config/cloudflare');
const { sendMail, emailTemplate } = require('../config/mailer');

const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const normalizeEmail = (value = '') => value.trim().toLowerCase();
const normalizeUsername = (value = '') => value.trim().toLowerCase();

const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;
  const body = `
    <div style="padding:40px 36px;">
      <h1 style="margin:0 0 12px;font-size:28px;color:#111827;">Reset your password</h1>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#4b5563;">
        We received a request to reset the password for your JobTracker account.
      </p>
      <p style="margin:0 0 24px;font-size:14px;line-height:1.7;color:#4b5563;">
        Use the button below to set a new password. This link expires in 1 hour.
      </p>
      <table cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:10px;">
            <a href="${resetUrl}" target="_blank"
               style="display:inline-block;padding:14px 24px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;">
              Reset Password
            </a>
          </td>
        </tr>
      </table>
      <p style="margin:24px 0 0;font-size:12px;line-height:1.7;color:#6b7280;">
        If you did not request this, you can ignore this email. Your password will remain unchanged.
      </p>
    </div>
  `;

  await sendMail({
    to: user.email,
    subject: 'Reset your JobTracker password',
    html: emailTemplate({
      title: 'Reset your password',
      preheader: 'Use this secure link to reset your JobTracker password.',
      body,
    }),
  });
};

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

    const normalizedEmail = normalizeEmail(email);
    const normalizedUsername = normalizeUsername(username);
    const trimmedName = name.trim();

    if (!trimmedName || !normalizedEmail || !normalizedUsername) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const userExists = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }]
    });
    if (userExists) {
      return res.status(400).json({ message: 'User with that email or username already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      username: normalizedUsername,
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

    const credential = usernameOrEmail.trim();
    const normalizedEmail = normalizeEmail(credential);
    const normalizedUsername = normalizeUsername(credential);
    const user = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }]
    });

    if (user && !user.password) {
      return res.status(400).json({ message: 'This account uses Google sign-in. Continue with Google.' });
    }

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

// @route   POST /api/auth/forgot-password
// @desc    Request a password reset email
router.post('/forgot-password', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email || '');
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();
      await sendPasswordResetEmail(user, resetToken);
    }

    res.json({
      message: 'If an account exists for that email, a password reset link has been sent.',
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to process password reset request' });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password using token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset link is invalid or has expired' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reset password' });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (typeof req.body.name === 'string' && req.body.name.trim()) {
      user.name = req.body.name.trim();
    }
    
    if (typeof req.body.username === 'string') {
      if (!req.body.username.trim()) {
        return res.status(400).json({ message: 'Username cannot be empty' });
      }

      const normalizedUsername = normalizeUsername(req.body.username);
      if (normalizedUsername !== user.username) {
        const existing = await User.findOne({ username: normalizedUsername });
        if (existing) {
          return res.status(400).json({ message: 'Username is already taken' });
        }
        user.username = normalizedUsername;
      }
    }

    if (typeof req.body.email === 'string') {
      if (!req.body.email.trim()) {
        return res.status(400).json({ message: 'Email cannot be empty' });
      }

      const normalizedEmail = normalizeEmail(req.body.email);
      if (normalizedEmail !== user.email) {
        const existingEmail = await User.findOne({ email: normalizedEmail });
        if (existingEmail) {
          return res.status(400).json({ message: 'Email is already taken' });
        }
        user.email = normalizedEmail;
      }
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
