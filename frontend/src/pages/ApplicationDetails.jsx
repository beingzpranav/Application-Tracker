import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Star, ChevronDown, Calendar, Phone, Send, FileText, Link as LinkIcon, Download, ExternalLink, Plus } from 'lucide-react';
import { getApplication, updateApplication } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import StatusBadge from '../components/StatusBadge';

const ApplicationDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useNotifications();
  
  const [app, setApp] = useState(location.state?.app || null);
  const [loading, setLoading] = useState(!app);
  const [status, setStatus] = useState(app?.status || 'Applied');
  const [notes, setNotes] = useState(app?.notes || '');

  useEffect(() => {
    if (!app) {
      fetchApp();
    }
  }, [id]);

  const fetchApp = async () => {
    try {
      const res = await getApplication(id);
      setApp(res.data);
      setStatus(res.data.status);
      setNotes(res.data.notes || '');
    } catch {
      addToast('Failed to load application details', 'error');
      navigate('/applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    try {
      await updateApplication(id, { status: newStatus });
      addToast('Status updated', 'success');
      setApp(prev => ({ ...prev, status: newStatus }));
    } catch {
      addToast('Failed to update status', 'error');
    }
  };

  const handleNotesChange = async (e) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    // Simple debounce would be better here, but save on blur works too
  };

  const saveNotes = async () => {
    if (notes !== app.notes) {
      try {
        await updateApplication(id, { notes });
        addToast('Notes saved', 'success');
        setApp(prev => ({ ...prev, notes }));
      } catch {
        addToast('Failed to save notes', 'error');
      }
    }
  };

  const toggleBookmark = async () => {
    try {
      const newBookmarked = !app.bookmarked;
      await updateApplication(id, { bookmarked: newBookmarked });
      setApp(prev => ({ ...prev, bookmarked: newBookmarked }));
      addToast(newBookmarked ? 'Application starred' : 'Application unstarred', 'success');
    } catch {
      addToast('Failed to update bookmark status', 'error');
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (loading) {
    return (
      <div className="app-details-page">
        <div className="details-back" style={{ marginBottom: '24px' }}>
          <div className="skeleton" style={{ width: '150px', height: '24px', borderRadius: '2px' }}></div>
        </div>
        <div className="skeleton" style={{ width: '100%', height: '100px', marginBottom: '24px', borderRadius: '2px' }}></div>
        <div className="bento-grid">
          <div className="bento-col-main">
            <div className="skeleton skeleton-chart"></div>
            <div className="skeleton skeleton-card"></div>
          </div>
          <div className="bento-col-side">
            <div className="skeleton skeleton-card" style={{ height: '200px' }}></div>
            <div className="skeleton skeleton-card" style={{ height: '150px' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!app) return null;

  return (
    <div className="app-details-page">
      {/* Breadcrumbs & Back */}
      <div className="details-back">
        <button className="btn btn-ghost" onClick={() => navigate('/applications')}>
          <ArrowLeft size={16} /> Back to Applications
        </button>
      </div>

      {/* Header Section (Bento Cell 1) */}
      <div className="bento-header bento-card">
        <div className="bento-header-info">
          <div className="bento-logo">
            {app.company.charAt(0).toUpperCase()}
          </div>
          <div className="bento-title-group">
            <div className="bento-title-row">
              <h2 className="bento-role">{app.role}</h2>
              <StatusBadge status={app.status} />
            </div>
            <p className="bento-company">
              {app.company}
              <span className="bento-dot">•</span>
              {app.priority} Priority
            </p>
          </div>
        </div>
        <div className="bento-header-actions">
          <button 
            className="btn-icon" 
            onClick={toggleBookmark}
            style={{ color: app.bookmarked ? 'var(--accent-green)' : 'var(--text-secondary)', borderColor: app.bookmarked ? 'var(--accent-green)' : 'var(--border-color)' }}
          >
            <Star size={20} fill={app.bookmarked ? 'var(--accent-green)' : 'none'} />
          </button>
          <div className="custom-select-wrapper">
            <select value={status} onChange={handleStatusChange} className="custom-select">
              <option value="Applied">Applied</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
              <option value="No Response">No Response</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="bento-grid">
        {/* Main Column (Left - 2 spans) */}
        <div className="bento-col-main">
          {/* Activity Timeline */}
          <section className="bento-card">
            <div className="bento-card-header">
              <h3>Activity Timeline</h3>
            </div>
            <div className="timeline-container">
              {app.activityLog && app.activityLog.length > 0 ? (
                [...app.activityLog].reverse().map((log, i) => (
                  <div key={i} className="timeline-item">
                    <div className="timeline-icon">
                      {log.action.includes('Applied') ? <Send size={16} /> :
                       log.action.includes('Interview') ? <Calendar size={16} /> :
                       <Star size={16} />}
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <h4>{log.action}</h4>
                      </div>
                      <p className="timeline-date">{formatDate(log.date)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p>No activity recorded yet.</p>
              )}
            </div>
          </section>

          {/* Notes Section */}
          <section className="bento-card bento-notes">
            <div className="bento-card-header">
              <h3>Personal Notes</h3>
            </div>
            <div className="notes-container">
              <textarea
                value={notes}
                onChange={handleNotesChange}
                onBlur={saveNotes}
                placeholder="Jot down thoughts, interview questions, or key takeaways..."
              />
            </div>
          </section>
        </div>

        {/* Right Column (Sidebar - 1 span) */}
        <div className="bento-col-side">
          {/* Job Details */}
          <section className="bento-card">
            <h3 className="bento-label">Job Details</h3>
            <dl className="details-list">
              <div className="details-item">
                <dt>Date Applied</dt>
                <dd>{formatDate(app.dateApplied)}</dd>
              </div>
              <div className="details-item">
                <dt>Priority</dt>
                <dd>{app.priority}</dd>
              </div>
              <div className="details-item">
                <dt>Follow-up Date</dt>
                <dd>{formatDate(app.followUpDate)}</dd>
              </div>
            </dl>
            {app.jobUrl && (
              <div className="details-footer">
                <a href={app.jobUrl} target="_blank" rel="noopener noreferrer" className="details-link">
                  View Original Posting <ExternalLink size={16} />
                </a>
              </div>
            )}
          </section>

          {/* Documents */}
          <section className="bento-card">
            <h3 className="bento-label">Documents</h3>
            <div className="documents-list">
              {app.resumeUrl ? (
                <div className="doc-item">
                  <div className="doc-icon"><FileText size={20} /></div>
                  <div className="doc-info">
                    <p className="doc-name">{app.resumeFileName || 'Resume.pdf'}</p>
                    <p className="doc-date">Attached</p>
                  </div>
                  <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className="doc-action">
                    <Download size={18} />
                  </a>
                </div>
              ) : (
                <p>No documents attached.</p>
              )}
              {app.jobUrl && (
                <div className="doc-item">
                  <div className="doc-icon doc-icon-link"><LinkIcon size={20} /></div>
                  <div className="doc-info">
                    <p className="doc-name">Job Description</p>
                    <p className="doc-date">External Link</p>
                  </div>
                  <a href={app.jobUrl} target="_blank" rel="noopener noreferrer" className="doc-action">
                    <ExternalLink size={18} />
                  </a>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetails;
