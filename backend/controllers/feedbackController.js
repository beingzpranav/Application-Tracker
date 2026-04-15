const { sendMail, emailTemplate } = require('../config/mailer');

const DEVELOPER_EMAIL = process.env.DEVELOPER_EMAIL || process.env.SMTP_USER;

const TYPE_COLOR = {
  'Bug Report':       '#ef4444',
  'Feature Request':  '#6366f1',
  'General':          '#10b981',
};

/**
 * @desc   Receive feedback from the landing page form and email the developer
 * @route  POST /api/feedback
 * @access Public
 */
const submitFeedback = async (req, res) => {
  try {
    const { name, email, type, message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const typeLabel   = type   || 'General';
    const senderName  = name   || 'Anonymous';
    const senderEmail = email  || null;
    const badgeColor  = TYPE_COLOR[typeLabel] || '#6b7280';
    const safeMessage = message.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const body = `
      <!-- Accent bar -->
      <div style="height:4px;background:linear-gradient(90deg,#6366f1,#8b5cf6);"></div>

      <div style="padding:36px 40px 40px;">

        <!-- Type badge -->
        <p style="margin:0 0 6px;">
          <span style="display:inline-block;padding:3px 10px;background:${badgeColor}1a;color:${badgeColor};font-size:11px;font-weight:700;letter-spacing:0.6px;text-transform:uppercase;border-radius:20px;border:1px solid ${badgeColor}33;">
            ${typeLabel}
          </span>
        </p>

        <h1 style="margin:12px 0 6px;font-size:22px;font-weight:700;color:#111827;letter-spacing:-0.5px;">
          New feedback from ${senderName}
        </h1>
        ${senderEmail
          ? `<p style="margin:0 0 28px;font-size:13px;color:#6b7280;">${senderEmail}</p>`
          : `<p style="margin:0 0 28px;font-size:13px;color:#9ca3af;">No email provided</p>`
        }

        <!-- Message box -->
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-left:3px solid ${badgeColor};border-radius:8px;padding:20px 24px;">
          <p style="margin:0;font-size:14px;color:#374151;line-height:1.75;white-space:pre-wrap;">${safeMessage}</p>
        </div>

        ${senderEmail ? `
        <!-- Reply button -->
        <table cellpadding="0" cellspacing="0" role="presentation" style="margin-top:28px;">
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:8px;">
              <a href="mailto:${senderEmail}?subject=Re: Your JobTracker feedback"
                 style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">
                Reply to ${senderName} &rarr;
              </a>
            </td>
          </tr>
        </table>` : ''}

      </div>
    `;

    if (DEVELOPER_EMAIL) {
      await sendMail({
        to: DEVELOPER_EMAIL,
        subject: `[${typeLabel}] ${senderName}: ${message.slice(0, 60)}${message.length > 60 ? '…' : ''}`,
        html: emailTemplate({
          title: `JobTracker Feedback — ${typeLabel}`,
          preheader: `${senderName} sent a ${typeLabel.toLowerCase()}: ${message.slice(0, 100)}`,
          body,
        }),
      });
    } else {
      console.log('📩 Feedback (SMTP not configured):', { senderName, typeLabel, message });
    }

    res.json({ message: 'Feedback sent successfully' });
  } catch (error) {
    console.error('Feedback error:', error.message);
    res.status(500).json({ message: 'Failed to send feedback' });
  }
};

module.exports = { submitFeedback };
