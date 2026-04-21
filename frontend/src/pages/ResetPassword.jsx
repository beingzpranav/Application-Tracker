import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, CheckCircle, AlertTriangle } from 'lucide-react';
import { resetPassword } from '../services/api';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Password reset token is missing.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword({ token, password: form.password });
      setSuccess(true);
      setTimeout(() => navigate('/login', { replace: true }), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reset password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="landing-page">
      <div className="landing-bg-orb orb-1" />
      <div className="landing-bg-orb orb-2" />
      <div className="landing-bg-orb orb-3" />

      <div className="reset-shell">
        <div className="reset-card">
          <Link to="/" className="reset-back">Back to home</Link>
          <div className="reset-icon">
            {success ? <CheckCircle size={26} /> : <Lock size={26} />}
          </div>
          <h1 className="reset-title">
            {success ? 'Password updated' : 'Set a new password'}
          </h1>
          <p className="reset-copy">
            {success
              ? 'Your password has been reset. Redirecting you to login.'
              : 'Enter a new password for your JobTracker account.'}
          </p>

          {!success && (
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="fb-field">
                <label>New Password</label>
                <input
                  type="password"
                  placeholder="Create a new password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  autoComplete="new-password"
                />
              </div>

              <div className="fb-field">
                <label>Confirm Password</label>
                <input
                  type="password"
                  placeholder="Repeat your new password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  autoComplete="new-password"
                />
              </div>

              {error && (
                <div className="fb-error">
                  <AlertTriangle size={14} /> {error}
                </div>
              )}

              <div className="auth-actions">
                <button
                  type="submit"
                  className="fb-submit auth-submit"
                  disabled={submitting}
                >
                  {submitting ? 'Resetting password...' : 'Reset Password'}
                </button>
                <Link to="/login" className="auth-google reset-link-btn">
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
