import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Shield } from 'lucide-react'

const LAST_UPDATED = 'April 15, 2026'

const sections = [
  {
    num: '01',
    title: 'Information We Collect',
    id: 'info',
    content: `JobTracker collects only the information you provide through Google OAuth sign-in — your name, email address, and profile photo. We also store the job application data you manually enter into the app, including company names, roles, dates, notes, and any resume files you upload.`,
  },
  {
    num: '02',
    title: 'How We Use Your Data',
    id: 'usage',
    content: `Your data is used solely to provide the JobTracker service — tracking your job applications, generating analytics, sending in-app and email reminders. We do not sell, trade, rent, or share your personal data with any third parties for marketing purposes.`,
  },
  {
    num: '03',
    title: 'Data Storage & Security',
    id: 'storage',
    content: `All application data is stored securely in our MongoDB database hosted on MongoDB Atlas with encryption at rest. Resume files are stored in Cloudflare R2 with private, signed URLs. All data in transit is protected using HTTPS/TLS encryption.`,
  },
  {
    num: '04',
    title: 'Authentication',
    id: 'auth',
    content: `We use Google OAuth 2.0 for authentication. We never store your Google password. Authentication is handled entirely by Google's secure infrastructure. We issue JSON Web Tokens (JWT) stored in your browser's local storage to maintain your session.`,
  },
  {
    num: '05',
    title: 'Cookies & Tracking',
    id: 'cookies',
    content: `JobTracker does not use advertising cookies or third-party tracking scripts. We use only essential session cookies required for the OAuth authentication flow, which expire within 60 seconds after login completion.`,
  },
  {
    num: '06',
    title: 'Third-Party Services',
    id: 'third-party',
    content: `We use the following third-party services: Google OAuth (authentication), MongoDB Atlas (database), Cloudflare R2 (file storage), and Zoho Mail (email notifications). Your use of these services is governed by their respective privacy policies.`,
  },
  {
    num: '07',
    title: 'Email Communications',
    id: 'email',
    content: `By signing up, you consent to receive transactional emails from JobTracker including: welcome emails upon registration, follow-up reminders 5 days after applying to a job, and stale application alerts after 10 days of inactivity. These emails are core to the service's functionality.`,
  },
  {
    num: '08',
    title: 'Data Retention',
    id: 'retention',
    content: `Your data is retained for as long as your account is active. If you request account deletion, all your personal data and application records will be permanently removed from our systems within 7 business days.`,
  },
  {
    num: '09',
    title: 'Your Rights',
    id: 'rights',
    content: `You have the right to access, correct, or delete your personal data at any time. To exercise these rights or to request a copy of your data, please contact us at contact@pranavk.tech. We will respond to all requests within 7 business days.`,
  },
  {
    num: '10',
    title: "Children's Privacy",
    id: 'children',
    content: `JobTracker is not directed at children under the age of 13. We do not knowingly collect personal information from children. If you believe we have inadvertently collected such information, please contact us immediately.`,
  },
  {
    num: '11',
    title: 'Changes to This Policy',
    id: 'changes',
    content: `We may update this Privacy Policy from time to time. We will notify you of any significant changes by updating the "Last Updated" date at the top of this page. Continued use of the service after changes constitutes acceptance of the updated policy.`,
  },
  {
    num: '12',
    title: 'Contact',
    id: 'contact',
    content: `If you have questions, concerns, or requests related to this Privacy Policy, please contact us at contact@pranavk.tech. We are committed to resolving any privacy concerns promptly and transparently.`,
  },
]

export default function Privacy () {
  useEffect(() => {
    document.title = 'Privacy Policy — JobTracker'
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="legal-page">
      {/* Nav */}
      <nav className="legal-nav">
        <Link to="/login" className="legal-nav-brand">
          <img src="/Logo.png" alt="JobTracker" className="navbar-logo" />
          <span className="brand-name">JobTracker</span>
        </Link>
        <Link to="/login" className="legal-back-link">
          <ArrowLeft size={14} /> Back to Home
        </Link>
      </nav>

      {/* Hero */}
      <div className="legal-page-hero">
        <div className="legal-hero-icon green">
          <Shield size={30} />
        </div>
        <div className="legal-hero-eyebrow">Legal Document</div>
        <h1>Privacy Policy</h1>
        <p className="legal-hero-meta">Last updated: {LAST_UPDATED}</p>
        <p className="legal-hero-intro">
          At JobTracker, your privacy is important to us. This policy explains
          what information we collect, how we use it, and the choices you have.
          We collect only what we need to run the service.
        </p>
      </div>

      <div className="legal-page-container">
        {/* Table of contents */}
        <div className="legal-toc">
          <p className="legal-toc-title">Quick navigation</p>
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`}>{s.num} {s.title}</a>
          ))}
        </div>

        {/* Sections */}
        <div className="legal-sections">
          {sections.map((s) => (
            <div key={s.id} id={s.id} className="legal-section">
              <div className="legal-section-num">{s.num}</div>
              <div className="legal-section-body">
                <h2>{s.title}</h2>
                <p>{s.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="legal-page-footer-note">
          <p>
            Questions about this policy?{' '}
            <a href="mailto:contact@pranavk.tech">contact@pranavk.tech</a>
          </p>
          <div className="legal-page-links">
            <Link to="/terms">Terms &amp; Conditions</Link>
            <span>·</span>
            <Link to="/login">Home</Link>
          </div>
        </div>
      </div>

      <footer className="legal-page-bottom">
        <p>
          &copy; {new Date().getFullYear()} JobTracker &middot; Built by{' '}
          <a
            href="https://pranavk.tech"
            target="_blank"
            rel="noreferrer"
            style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}
          >
            Pranav
          </a>
        </p>
      </footer>
    </div>
  )
}
