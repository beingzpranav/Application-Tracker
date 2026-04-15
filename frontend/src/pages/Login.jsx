import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity, Calendar, FileText, Bell, Mail,
  MessageSquare, X, Globe, Shield, BookOpen, Send, CheckCircle,
} from 'lucide-react';

const GithubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
)

const LinkedinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const FEEDBACK_TYPES = [
  { label: 'General', emoji: '💬', color: '#6366f1' },
  { label: 'Bug Report', emoji: '🐛', color: '#ef4444' },
  { label: 'Feature Request', emoji: '✨', color: '#f59e0b' },
]

const MAX_CHARS = 500

function FeedbackModal ({ onClose }) {
  const [form, setForm] = useState({
    name: '', email: '', type: 'General', message: '',
  })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const charsLeft = MAX_CHARS - form.message.length
  const isValid = form.message.trim().length >= 10

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isValid) return
    setSending(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed')
      setSent(true)
    } catch {
      setError('Could not send. Please email contact@pranavk.tech directly.')
    } finally {
      setSending(false)
    }
  }

  const selectedType = FEEDBACK_TYPES.find((t) => t.label === form.type)

  return (
    <div className="fb-overlay" onClick={onClose}>
      <div className="fb-modal" onClick={(e) => e.stopPropagation()}>
        <div className="fb-panel-left">
          <div className="fb-brand">
            <img src="/Logo.png" alt="JobTracker" className="navbar-logo" />
            <span className="brand-name" style={{ fontSize: 18 }}>JobTracker</span>
          </div>
          <h2 className="fb-panel-title">We'd love your feedback</h2>
          <p className="fb-panel-sub">
            Help us make JobTracker better. Share a bug, suggest a feature,
            or just tell us what you think.
          </p>
          <div className="fb-type-list">
            {FEEDBACK_TYPES.map(({ label, emoji, color }) => (
              <button
                key={label}
                type="button"
                className={`fb-type-btn ${form.type === label ? 'fb-type-active' : ''}`}
                style={
                  form.type === label
                    ? { borderColor: color, background: `${color}14` }
                    : {}
                }
                onClick={() => setForm({ ...form, type: label })}
              >
                <span className="fb-type-emoji">{emoji}</span>
                <span>{label}</span>
                {form.type === label && (
                  <span className="fb-type-check" style={{ color }}>✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="fb-panel-right">
          <button className="fb-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>

          {sent ? (
            <div className="fb-success">
              <div className="fb-success-icon">
                <CheckCircle size={44} />
              </div>
              <h3>Thank you! 🎉</h3>
              <p>
                Your {form.type.toLowerCase()} has been received.
                We read every message and truly appreciate you taking the time.
              </p>
              <button className="btn btn-primary" onClick={onClose}>
                Back to JobTracker
              </button>
            </div>
          ) : (
            <form className="fb-form" onSubmit={handleSubmit} noValidate>
              <div className="fb-form-header">
                <span
                  className="fb-type-tag"
                  style={{
                    background: `${selectedType.color}18`,
                    color: selectedType.color,
                    border: `1px solid ${selectedType.color}33`,
                  }}
                >
                  {selectedType.emoji} {selectedType.label}
                </span>
                <h3>Share your thoughts</h3>
              </div>

              <div className="fb-row">
                <div className="fb-field">
                  <label>Name <span className="fb-optional">(optional)</span></label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    autoComplete="name"
                  />
                </div>
                <div className="fb-field">
                  <label>Email <span className="fb-optional">(optional)</span></label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="fb-field">
                <div className="fb-label-row">
                  <label>
                    Message <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <span className={`fb-chars ${charsLeft < 50 ? 'fb-chars-warn' : ''}`}>
                    {charsLeft}
                  </span>
                </div>
                <textarea
                  placeholder={
                    form.type === 'Bug Report'
                      ? 'Describe what happened and how to reproduce it...'
                      : form.type === 'Feature Request'
                      ? 'Describe the feature and why it would be useful...'
                      : 'Tell us what you think about JobTracker...'
                  }
                  value={form.message}
                  onChange={(e) => {
                    if (e.target.value.length <= MAX_CHARS) {
                      setForm({ ...form, message: e.target.value })
                    }
                  }}
                  rows={5}
                  required
                />
                {form.message.length > 0 && form.message.trim().length < 10 && (
                  <p className="fb-hint">Please write at least 10 characters.</p>
                )}
              </div>

              {error && (
                <div className="fb-error">
                  <span>⚠️</span> {error}
                </div>
              )}

              <div className="fb-actions">
                <button
                  type="submit"
                  className="fb-submit"
                  disabled={sending || !isValid}
                >
                  {sending ? (
                    <>
                      <span className="fb-spinner" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      Send {form.type}
                    </>
                  )}
                </button>
                <button type="button" className="fb-cancel" onClick={onClose}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

const LandingPage = () => {
  const { loading, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [showFeedback, setShowFeedback] = useState(false)

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE.replace('/api', '')}/api/auth/google`
  }

  const handleGoToApp = () => {
    navigate('/dashboard')
  }

  if (loading) {
    return (
      <div className="landing-page loading">
        <div className="loading-spinner" />
      </div>
    )
  }

  return (
    <div className="landing-page">
      <div className="landing-bg-orb orb-1" />
      <div className="landing-bg-orb orb-2" />
      <div className="landing-bg-orb orb-3" />

      {/* Navbar */}
      <nav className="landing-nav">
        <div className="nav-brand">
          <img src="/Logo.png" alt="JobTracker" className="navbar-logo" />
          <span className="brand-name">JobTracker</span>
        </div>
        <div className="nav-actions">
          {isAuthenticated ? (
            <button className="btn btn-primary" onClick={handleGoToApp}>
              Go to Dashboard
            </button>
          ) : (
            <button className="btn btn-ghost" onClick={handleGoogleLogin}>
              Log In
            </button>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="badge">✨ Supercharge your job search</div>
          <h1 className="hero-title">
            The Smart Way to Track <br />
            <span className="text-gradient">Your Career Journey</span>
          </h1>
          <p className="hero-subtitle">
            Say goodbye to messy spreadsheets. JobTracker intelligently organizes
            your applications, sends follow-up reminders, and gives you actionable
            insights to land your dream job faster.
          </p>
          <div className="hero-actions">
            {isAuthenticated ? (
              <button className="btn btn-primary btn-lg" onClick={handleGoToApp}>
                Enter Application
              </button>
            ) : (
              <button className="btn-google-large" onClick={handleGoogleLogin}>
                <svg width="22" height="22" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <span>Continue with Google</span>
              </button>
            )}
          </div>
          <p className="hero-privacy">
            Free to use · Secure data · No credit card required
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="features-section" id="features">
        <h2 className="section-title">Everything you need to succeed</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"><Activity /></div>
            <h3>Smart Dashboard</h3>
            <p>Visual analytics of your success rate, weekly applications, and overall progress.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Bell /></div>
            <h3>Intelligent Alerts</h3>
            <p>Get notified when it's time to follow up or when an application goes stale.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><FileText /></div>
            <h3>Resume Management</h3>
            <p>Securely upload and assign resumes to specific job applications using cloud storage.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Calendar /></div>
            <h3>Timeline Tracking</h3>
            <p>Track every stage from Applied to Interviewing, to Offer or Rejection.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-top">
          {/* Brand */}
          <div className="footer-brand-col">
            <div className="footer-brand">
              <img src="/Logo.png" alt="JobTracker" className="navbar-logo" />
              <span className="brand-name">JobTracker</span>
            </div>
            <p className="footer-tagline">
              The smart way to manage your job search. Track applications,
              get follow-up reminders, and land your dream role faster.
            </p>
          </div>

          {/* Product */}
          <div className="footer-col">
            <h4 className="footer-col-title">Product</h4>
            <ul className="footer-link-list">
              <li><a href="#features">Features</a></li>
              <li><a href="#features">Analytics Dashboard</a></li>
              <li><a href="#features">Smart Reminders</a></li>
              <li><a href="#features">Resume Management</a></li>
            </ul>
          </div>

          {/* Developer */}
          <div className="footer-col">
            <h4 className="footer-col-title">Developer</h4>
            <ul className="footer-link-list">
              <li>
                <a href="https://pranavk.tech" target="_blank" rel="noreferrer">
                  <Globe size={14} />
                  Portfolio
                </a>
              </li>
              <li>
                <a href="https://github.com/beingzpranav" target="_blank" rel="noreferrer">
                  <GithubIcon />
                  GitHub
                </a>
              </li>
              <li>
                <a href="https://linkedin.com/in/beingzpranav" target="_blank" rel="noreferrer">
                  <LinkedinIcon />
                  LinkedIn
                </a>
              </li>
              <li>
                <a href="mailto:contact@pranavk.tech">
                  <Mail size={14} />
                  contact@pranavk.tech
                </a>
              </li>
            </ul>
          </div>

          {/* Legal + Feedback */}
          <div className="footer-col">
            <h4 className="footer-col-title">Legal</h4>
            <ul className="footer-link-list">
              <li>
                <Link to="/privacy" className="footer-link-btn">
                  <Shield size={14} />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="footer-link-btn">
                  <BookOpen size={14} />
                  Terms &amp; Conditions
                </Link>
              </li>
            </ul>

            <h4 className="footer-col-title" style={{ marginTop: '28px' }}>
              Feedback
            </h4>
            <button
              className="btn-feedback"
              onClick={() => setShowFeedback(true)}
            >
              <MessageSquare size={15} />
              <span>Send Feedback</span>
            </button>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-bottom-copy">
            &copy; {new Date().getFullYear()} JobTracker. Built with ❤️ by{' '}
            <a href="https://pranavk.tech" target="_blank" rel="noreferrer">
              Pranav
            </a>
            . All rights reserved.
          </p>
          <div className="footer-bottom-legal">
            <Link to="/privacy" className="footer-link-btn">
              Privacy Policy
            </Link>
            <span className="footer-divider">·</span>
            <Link to="/terms" className="footer-link-btn">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </footer>

      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
    </div>
  )
}

export default LandingPage
