const cron = require('node-cron');
const Application = require('../models/Application');
const { sendMail, emailTemplate } = require('../config/mailer');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/** Returns the start and end of today (midnight → 23:59:59) */
const todayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

/** Groups applications by their owner */
const groupByUser = (apps) => {
  const map = {};
  apps.forEach((app) => {
    const uid = app.user._id.toString();
    if (!map[uid]) map[uid] = { user: app.user, apps: [] };
    map[uid].apps.push(app);
  });
  return Object.values(map);
};

/** Renders a clean application row for the email */
const appRow = (app) => `
  <tr>
    <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td style="vertical-align:top;">
            <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#111827;">${app.company}</p>
            <p style="margin:0;font-size:13px;color:#6b7280;">${app.role}</p>
          </td>
          <td style="vertical-align:top;text-align:right;white-space:nowrap;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              Applied ${new Date(app.dateApplied).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;

/** CTA button */
const ctaButton = (href, label) => `
  <table cellpadding="0" cellspacing="0" role="presentation" style="margin-top:28px;">
    <tr>
      <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:8px;">
        <a href="${href}" target="_blank"
           style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:-0.1px;">
          ${label} &rarr;
        </a>
      </td>
    </tr>
  </table>`;

/** Step item for the "what to do" section */
const step = (number, heading, detail) => `
  <tr>
    <td style="padding:10px 0;vertical-align:top;width:28px;">
      <div style="width:22px;height:22px;background:#ede9fe;border-radius:50%;text-align:center;line-height:22px;font-size:11px;font-weight:700;color:#7c3aed;">${number}</div>
    </td>
    <td style="padding:10px 0 10px 10px;vertical-align:top;">
      <p style="margin:0 0 2px;font-size:13px;font-weight:600;color:#111827;">${heading}</p>
      <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;">${detail}</p>
    </td>
  </tr>`;

/**
 * 5-day follow-up reminder email.
 * Sent ONCE on the exact day followUpDate falls.
 */
const sendFollowUpEmail = async (user, apps) => {
  const count = apps.length;
  const firstName = user.name.split(' ')[0];

  const body = `
    <!-- Accent bar -->
    <div style="height:4px;background:linear-gradient(90deg,#6366f1,#8b5cf6);"></div>

    <!-- Content -->
    <div style="padding:36px 40px 40px;">

      <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#6366f1;letter-spacing:0.5px;text-transform:uppercase;">Follow-Up Reminder</p>
      <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#111827;letter-spacing:-0.5px;">
        Time to check in, ${firstName}.
      </h1>
      <p style="margin:0 0 28px;font-size:15px;color:#4b5563;line-height:1.7;">
        It's been <strong>5 days</strong> since you applied to the following
        ${count === 1 ? 'position' : `${count} positions`}.
        Now is a good time to either update the status if you heard back,
        or send a polite follow-up to the recruiter.
      </p>

      <!-- Application list -->
      <div style="background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;padding:4px 16px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          ${apps.map(appRow).join('')}
        </table>
      </div>

      <!-- What to do -->
      <h2 style="margin:32px 0 12px;font-size:14px;font-weight:600;color:#374151;">Suggested next steps</h2>
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        ${step(1, 'Got a reply?', 'Open JobTracker and update the status to Interview, Offer, or Rejected so your dashboard stays accurate.')}
        ${step(2, 'No reply yet?', 'Send a short, friendly follow-up email to the recruiter referencing your application date.')}
        ${step(3, 'Not interested anymore?', 'Mark it as Rejected in the app to keep your pipeline clean.')}
      </table>

      ${ctaButton(`${FRONTEND_URL}/applications`, 'Update your applications')}

    </div>
  `;

  await sendMail({
    to: user.email,
    subject: `Follow up on ${count === 1 ? `your application at ${apps[0].company}` : `${count} applications`}`,
    html: emailTemplate({
      title: 'Follow-Up Reminder — JobTracker',
      preheader: `It's been 5 days since you applied to ${apps[0].company}${count > 1 ? ` and ${count - 1} other${count - 1 > 1 ? 's' : ''}` : ''}. Time to check in.`,
      body,
    }),
  });
};

/**
 * 10-day stale alert email.
 * Sent ONCE on the exact day the app crosses the 10-day mark.
 * Apps are auto-marked "No Response" before this email is sent.
 */
const sendStaleEmail = async (user, apps) => {
  const count = apps.length;
  const firstName = user.name.split(' ')[0];

  const body = `
    <!-- Accent bar -->
    <div style="height:4px;background:linear-gradient(90deg,#f59e0b,#ef4444);"></div>

    <!-- Content -->
    <div style="padding:36px 40px 40px;">

      <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#d97706;letter-spacing:0.5px;text-transform:uppercase;">Status Update</p>
      <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#111827;letter-spacing:-0.5px;">
        No response after 10 days, ${firstName}.
      </h1>
      <p style="margin:0 0 28px;font-size:15px;color:#4b5563;line-height:1.7;">
        The following ${count === 1 ? 'application has' : `${count} applications have`} been automatically
        moved to <strong style="color:#ef4444;">No Response</strong> since there's been no activity
        in over 10 days. We've updated your tracker — here's a summary.
      </p>

      <!-- Application list -->
      <div style="background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;padding:4px 16px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          ${apps.map(appRow).join('')}
        </table>
      </div>

      <!-- What to do -->
      <h2 style="margin:32px 0 12px;font-size:14px;font-weight:600;color:#374151;">What you can do now</h2>
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        ${step(1, 'Send one final follow-up', 'A brief, professional email can sometimes revive a quiet application. Keep it short and reference your original application.')}
        ${step(2, 'Move on if needed', 'Your status has already been updated. Use JobTracker to focus your energy on active opportunities.')}
        ${step(3, 'Review your approach', 'Check your resume, cover letter, or role fit if you\'re seeing this for multiple applications.')}
      </table>

      ${ctaButton(`${FRONTEND_URL}/applications`, 'View your applications')}

    </div>
  `;

  await sendMail({
    to: user.email,
    subject: `No response after 10 days${count === 1 ? ` — ${apps[0].company}` : ` — ${count} applications`}`,
    html: emailTemplate({
      title: 'Application Status Update — JobTracker',
      preheader: `${count === 1 ? `${apps[0].company} (${apps[0].role})` : `${count} applications`} marked No Response after 10 days of inactivity.`,
      body,
    }),
  });
};

/**
 * Daily cron — runs every day at 9:00 AM.
 *
 * Trigger 1 — 5-day follow-up (fires ONCE on day 5):
 *   Matches "Applied" apps where followUpDate is exactly today.
 *
 * Trigger 2 — 10-day stale alert (fires ONCE on day 10):
 *   Matches "Applied" apps where lastUpdated was exactly 10 days ago.
 *   Auto-marks them "No Response" then emails the user.
 */
const staleDetectionJob = () => {
  cron.schedule('0 9 * * *', async () => {
    console.log('⏰ Running daily alert cron...');
    try {
      const { start, end } = todayRange();

      // ── Trigger 1: 5-day follow-up ────────────────────────────────────────
      const followUpApps = await Application.find({
        followUpDate: { $gte: start, $lte: end },
        status: 'Applied',
      }).populate('user', 'name email');

      if (followUpApps.length > 0) {
        for (const { user, apps } of groupByUser(followUpApps)) {
          await sendFollowUpEmail(user, apps);
        }
        console.log(`📧 Follow-up emails sent for ${followUpApps.length} application(s)`);
      }

      // ── Trigger 2: 10-day stale ───────────────────────────────────────────
      const staleStart = new Date(start);
      staleStart.setDate(staleStart.getDate() - 10);
      const staleEnd = new Date(end);
      staleEnd.setDate(staleEnd.getDate() - 10);

      const staleApps = await Application.find({
        lastUpdated: { $gte: staleStart, $lte: staleEnd },
        status: 'Applied',
      }).populate('user', 'name email');

      if (staleApps.length > 0) {
        await Application.updateMany(
          { _id: { $in: staleApps.map((a) => a._id) } },
          {
            $set: { status: 'No Response', lastUpdated: new Date() },
            $push: {
              activityLog: {
                action: 'Auto-marked as No Response (no update in 10 days)',
                date: new Date(),
              },
            },
          }
        );

        for (const { user, apps } of groupByUser(staleApps)) {
          await sendStaleEmail(user, apps);
        }
        console.log(`🚨 Stale emails sent for ${staleApps.length} application(s)`);
      }
    } catch (err) {
      console.error('❌ Alert cron error:', err.message);
    }
  });

  console.log('🕐 Daily alert cron scheduled — runs at 9:00 AM every day');
};

module.exports = { staleDetectionJob };
