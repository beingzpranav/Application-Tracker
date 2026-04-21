const nodemailer = require('nodemailer');

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.zoho.in',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

/**
 * Sends an email. Returns true on success, false on failure.
 * @param {{ to: string, subject: string, html: string }} options
 */
const sendMail = async ({ to, subject, html }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️  SMTP not configured — skipping email to', to);
    return false;
  }
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"alerts JobTracker" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (err) {
    console.error('❌ Mail error:', err.message);
    return false;
  }
};

/**
 * Professional email base layout.
 * @param {{ title: string, preheader: string, body: string }} opts
 */
const emailTemplate = ({ title, preheader, body }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

  <!-- Preheader (hidden preview text) -->
  <span style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</span>

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f4f4f5;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Card -->
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:580px;">

          <!-- Logo Header -->
          <tr>
            <td style="padding-bottom:24px;">
              <table cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:10px;width:36px;height:36px;text-align:center;vertical-align:middle;">
                    <span style="color:#fff;font-size:18px;font-weight:700;line-height:36px;">J</span>
                  </td>
                  <td style="padding-left:10px;vertical-align:middle;">
                    <span style="font-size:16px;font-weight:700;color:#111827;letter-spacing:-0.3px;">JobTracker</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Email Body Card -->
          <tr>
            <td style="background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:28px;text-align:center;">
              <p style="margin:0 0 6px;font-size:12px;color:#9ca3af;">
                You're receiving this because you use <strong style="color:#6b7280;">JobTracker</strong>.
              </p>
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                &copy; ${new Date().getFullYear()} JobTracker &middot; pranavk.tech
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

module.exports = { sendMail, emailTemplate };
