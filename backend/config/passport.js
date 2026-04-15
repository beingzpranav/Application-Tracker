const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const { sendMail, emailTemplate } = require('./mailer');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const sendWelcomeEmail = async (user) => {
  const firstName = user.name.split(' ')[0];

  const body = `
    <!-- Top gradient bar -->
    <div style="height:4px;background:linear-gradient(90deg,#6366f1,#8b5cf6,#06b6d4);"></div>

    <div style="padding:48px 40px 40px;">

      <!-- Avatar + greeting -->
      <div style="text-align:center;margin-bottom:36px;">
        ${user.avatar
          ? `<img src="${user.avatar}" width="72" height="72"
               style="border-radius:50%;border:3px solid #ede9fe;display:block;margin:0 auto 16px;" />`
          : `<div style="width:72px;height:72px;background:linear-gradient(135deg,#6366f1,#8b5cf6);
               border-radius:50%;display:flex;align-items:center;justify-content:center;
               margin:0 auto 16px;font-size:28px;font-weight:700;color:white;line-height:72px;
               text-align:center;">${firstName.charAt(0)}</div>`
        }
        <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#111827;letter-spacing:-0.5px;">
          Welcome to JobTracker, ${firstName}! 🎉
        </h1>
        <p style="margin:0;font-size:15px;color:#6b7280;">
          Your account is ready. Let's get your job search organised.
        </p>
      </div>

      <!-- Divider -->
      <div style="height:1px;background:#f3f4f6;margin-bottom:36px;"></div>

      <!-- What you can do -->
      <p style="margin:0 0 20px;font-size:13px;font-weight:700;color:#374151;
         letter-spacing:0.6px;text-transform:uppercase;">Here's what you can do</p>

      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td style="padding:0 0 16px;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                   style="background:#fafafa;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
              <tr>
                <td style="padding:16px 20px;border-left:4px solid #6366f1;vertical-align:top;">
                  <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#111827;">📋 Track Applications</p>
                  <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;">
                    Add every job you apply to — company, role, date, priority, and status.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 0 16px;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                   style="background:#fafafa;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
              <tr>
                <td style="padding:16px 20px;border-left:4px solid #f59e0b;vertical-align:top;">
                  <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#111827;">⏰ Get Reminders</p>
                  <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;">
                    We'll email you 5 days after applying to remind you to follow up with the recruiter.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 0 16px;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                   style="background:#fafafa;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
              <tr>
                <td style="padding:16px 20px;border-left:4px solid #10b981;vertical-align:top;">
                  <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#111827;">📊 See Your Progress</p>
                  <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;">
                    Your dashboard shows response rate, offer rate, weekly trends, and status breakdown.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 0 0;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                   style="background:#fafafa;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
              <tr>
                <td style="padding:16px 20px;border-left:4px solid #8b5cf6;vertical-align:top;">
                  <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#111827;">📎 Attach Resumes</p>
                  <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;">
                    Upload a different resume for each application and access it anytime.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- CTA -->
      <div style="text-align:center;margin-top:36px;">
        <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto;">
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:10px;">
              <a href="${FRONTEND_URL}" target="_blank"
                 style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;
                        color:#ffffff;text-decoration:none;letter-spacing:-0.2px;">
                Go to your Dashboard &rarr;
              </a>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;">
          Questions? Reply to this email or visit <a href="${FRONTEND_URL}" style="color:#6366f1;">pranavk.tech</a>
        </p>
      </div>

    </div>
  `;

  await sendMail({
    to: user.email,
    subject: `Welcome to JobTracker, ${firstName}! 🎉`,
    html: emailTemplate({
      title: 'Welcome to JobTracker',
      preheader: `Hi ${firstName}, your JobTracker account is ready. Start tracking your applications and never miss a follow-up.`,
      body,
    }),
  });
};

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Only register Google strategy if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id') {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            return done(null, user);
          }

          // Brand-new user — create account then send welcome email
          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            avatar: profile.photos[0]?.value || '',
          });

          // Fire-and-forget — don't block the OAuth flow
          sendWelcomeEmail(user).catch((err) =>
            console.error('Welcome email failed:', err.message)
          );

          done(null, user);
        } catch (err) {
          done(err, null);
        }
      }
    )
  );
  console.log('✅ Google OAuth strategy configured');
} else {
  console.log('⚠️  Google OAuth not configured — set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env');
}

module.exports = passport;
