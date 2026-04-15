const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const session = require('express-session');
const connectDB = require('./config/db');
const passport = require('./config/passport');
const applicationRoutes = require('./routes/applicationRoutes');
const authRoutes = require('./routes/authRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const { staleDetectionJob } = require('./cron/staleDetection');

connectDB();

const app = express();

const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, mobile apps)
    if (!origin) return callback(null, true);
    // Allow any Vercel preview / production deployments
    if (
      ALLOWED_ORIGINS.includes(origin) ||
      /\.vercel\.app$/.test(origin)
    ) {
      return callback(null, true);
    }
    callback(new Error(`CORS: origin '${origin}' not allowed`));
  },
  credentials: true,
}));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'job-tracker-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/feedback', feedbackRoutes);

// Health check — also used as the UptimeRobot ping target
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);

  staleDetectionJob();

  // ── Keep-alive self-ping (backup for Render free tier) ──────────────────
  // Pings own /api/health every 14 min so Render never hits the 15-min
  // inactivity threshold. Pair with UptimeRobot for 100% reliability.
  if (process.env.RENDER_EXTERNAL_URL) {
    const selfUrl = `${process.env.RENDER_EXTERNAL_URL}/api/health`;
    cron.schedule('*/14 * * * *', async () => {
      try {
        const res = await fetch(selfUrl);
        const data = await res.json();
        console.log(`🏓 Keep-alive ping → ${data.status} (${data.timestamp})`);
      } catch (err) {
        console.warn('⚠️  Keep-alive ping failed:', err.message);
      }
    });
    console.log(`🏓 Keep-alive cron started → pinging ${selfUrl} every 14 min`);
  }
});
