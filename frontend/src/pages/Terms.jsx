import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, BookOpen } from 'lucide-react'

const LAST_UPDATED = 'April 15, 2026'

const sections = [
  {
    num: '01',
    title: 'Acceptance of Terms',
    id: 'acceptance',
    content: `By accessing or using JobTracker ("the Service"), you confirm that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the Service. These terms apply to all users of the Service.`,
  },
  {
    num: '02',
    title: 'Description of Service',
    id: 'description',
    content: `JobTracker is a web-based job application tracking tool that allows users to record, manage, and analyse their job search activity. Features include application tracking, status management, follow-up reminders, resume storage, and analytics dashboards.`,
  },
  {
    num: '03',
    title: 'User Accounts',
    id: 'accounts',
    content: `Access to JobTracker requires authentication via Google OAuth 2.0. You must have a valid Google account to use the Service. You are responsible for all activity that occurs under your account. You agree to notify us immediately of any unauthorised use of your account at contact@pranavk.tech.`,
  },
  {
    num: '04',
    title: 'Acceptable Use',
    id: 'acceptable-use',
    content: `You agree to use JobTracker only for lawful purposes and in a manner consistent with all applicable laws and regulations. You must not: attempt to gain unauthorised access to the Service; use the Service to store or transmit malicious code; reverse-engineer any part of the Service; or use automated tools to scrape data from the Service.`,
  },
  {
    num: '05',
    title: 'User Content',
    id: 'content',
    content: `You retain ownership of all content you submit to JobTracker, including job application data, notes, and resume files. By uploading content, you grant JobTracker a limited, non-exclusive licence to store and process that content solely for the purpose of providing the Service to you.`,
  },
  {
    num: '06',
    title: 'Resume & File Uploads',
    id: 'uploads',
    content: `You may upload resume files (PDF, DOC, DOCX) up to 5 MB per file. Files are stored securely on Cloudflare R2 and are accessible only to you via private, signed URLs. You are solely responsible for ensuring that any files you upload do not infringe third-party intellectual property rights.`,
  },
  {
    num: '07',
    title: 'Intellectual Property',
    id: 'ip',
    content: `The JobTracker name, logo, interface design, and underlying codebase are the intellectual property of the developer. You may not reproduce, distribute, modify, or create derivative works of any part of the Service without express written permission. All rights not explicitly granted are reserved.`,
  },
  {
    num: '08',
    title: 'Email Communications',
    id: 'email',
    content: `By creating an account, you consent to receive transactional emails including welcome messages, follow-up reminders, and stale application alerts. These communications are integral to the Service and cannot be disabled independently of your account.`,
  },
  {
    num: '09',
    title: 'Third-Party Services',
    id: 'third-party',
    content: `JobTracker integrates with third-party services including Google (authentication), MongoDB Atlas (data storage), Cloudflare R2 (file storage), and Zoho Mail (email delivery). Your use of these integrated services is also governed by their respective terms of service.`,
  },
  {
    num: '10',
    title: 'Disclaimer of Warranties',
    id: 'disclaimer',
    content: `JobTracker is provided "as is" and "as available" without any warranties of any kind, express or implied. We do not warrant that the Service will be uninterrupted, error-free, or free of viruses or other harmful components. Your use of the Service is at your sole risk.`,
  },
  {
    num: '11',
    title: 'Limitation of Liability',
    id: 'liability',
    content: `To the fullest extent permitted by applicable law, the developer of JobTracker shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from or related to your use of the Service. Our total aggregate liability shall not exceed the amount you paid us in the preceding 12 months (which, for a free service, is zero).`,
  },
  {
    num: '12',
    title: 'Service Availability',
    id: 'availability',
    content: `We strive to maintain high availability but do not guarantee uninterrupted access to the Service. We reserve the right to modify, suspend, or discontinue the Service at any time, with or without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuation of the Service.`,
  },
  {
    num: '13',
    title: 'Termination',
    id: 'termination',
    content: `We reserve the right to terminate or suspend your access to the Service at any time, without prior notice or liability, if you breach these Terms. Upon termination, your right to use the Service will immediately cease. You may also request account deletion at any time by contacting contact@pranavk.tech.`,
  },
  {
    num: '14',
    title: 'Governing Law',
    id: 'governing-law',
    content: `These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in India.`,
  },
  {
    num: '15',
    title: 'Changes to Terms',
    id: 'changes',
    content: `We reserve the right to update these Terms at any time. We will indicate the date of the most recent revision at the top of this page. Your continued use of the Service after any changes constitutes your acceptance of the new Terms.`,
  },
  {
    num: '16',
    title: 'Contact',
    id: 'contact',
    content: `If you have questions about these Terms, please contact us at contact@pranavk.tech. We aim to respond to all enquiries within 7 business days.`,
  },
]

export default function Terms () {
  useEffect(() => {
    document.title = 'Terms & Conditions — JobTracker'
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
        <div className="legal-hero-icon indigo">
          <BookOpen size={30} />
        </div>
        <div className="legal-hero-eyebrow">Legal Document</div>
        <h1>Terms &amp; Conditions</h1>
        <p className="legal-hero-meta">Last updated: {LAST_UPDATED}</p>
        <p className="legal-hero-intro">
          Please read these Terms and Conditions carefully before using
          JobTracker. These terms govern your access to and use of our service.
          By signing in, you agree to these terms in full.
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
            Questions about these terms?{' '}
            <a href="mailto:contact@pranavk.tech">contact@pranavk.tech</a>
          </p>
          <div className="legal-page-links">
            <Link to="/privacy">Privacy Policy</Link>
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
