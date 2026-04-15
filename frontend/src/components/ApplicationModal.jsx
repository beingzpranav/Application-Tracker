import { useState, useEffect } from 'react';
import { X, Clock, Activity, ExternalLink, FileText, Upload, Trash2 } from 'lucide-react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { uploadResume, deleteResume } from '../services/api';
import { useNotifications } from '../context/NotificationContext';

const ApplicationModal = ({ application, onClose, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { addToast } = useNotifications();
  const [formData, setFormData] = useState({
    status: '',
    notes: '',
    priority: '',
    jobUrl: '',
  });

  useEffect(() => {
    if (application) {
      setFormData({
        status: application.status,
        notes: application.notes || '',
        priority: application.priority,
        jobUrl: application.jobUrl || '',
      });
    }
  }, [application]);

  if (!application) return null;

  const handleSave = () => {
    onUpdate(application._id, formData);
    setIsEditing(false);
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedTypes.includes(file.type)) {
      addToast('Only PDF, DOC, and DOCX files are allowed', 'warning');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast('File size must be less than 5MB', 'warning');
      return;
    }

    setUploading(true);
    try {
      await uploadResume(application._id, file);
      addToast('Resume uploaded successfully!', 'success');
      // Trigger refresh
      onUpdate(application._id, {});
    } catch (error) {
      addToast('Failed to upload resume', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleResumeDelete = async () => {
    if (!window.confirm('Remove the attached resume?')) return;
    try {
      await deleteResume(application._id);
      addToast('Resume removed', 'success');
      onUpdate(application._id, {});
    } catch (error) {
      addToast('Failed to remove resume', 'error');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isFollowUpDue =
    application.status === 'Applied' &&
    new Date(application.followUpDate) <= new Date();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="modal-header">
          <div>
            <h2>{application.company}</h2>
            <p className="modal-role">{application.role}</p>
          </div>
          <div className="modal-badges">
            <StatusBadge status={application.status} />
            <PriorityBadge priority={application.priority} />
          </div>
        </div>

        {isFollowUpDue && (
          <div className="modal-alert">
            <Clock size={16} />
            <span>Follow-up is due! Consider reaching out to the recruiter.</span>
          </div>
        )}

        {/* Job URL Link */}
        {application.jobUrl && (
          <a
            href={application.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="modal-job-link"
          >
            <ExternalLink size={15} />
            <span>View Job Posting</span>
          </a>
        )}

        <div className="modal-details">
          <div className="detail-row">
            <span className="detail-label">Date Applied</span>
            <span className="detail-value">{formatDate(application.dateApplied)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Follow-up Date</span>
            <span className="detail-value">{formatDate(application.followUpDate)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Last Updated</span>
            <span className="detail-value">{formatDate(application.lastUpdated)}</span>
          </div>
        </div>

        {/* Resume Section */}
        <div className="modal-resume-section">
          <h4><FileText size={16} /> Resume</h4>
          {application.resumeUrl ? (
            <div className="resume-attached">
              <div className="resume-file-info">
                <FileText size={18} />
                <div>
                  <a
                    href={application.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="resume-file-name"
                  >
                    {application.resumeFileName || 'Resume'}
                  </a>
                  <span className="resume-label">Attached resume</span>
                </div>
              </div>
              <div className="resume-actions-inline">
                <a
                  href={application.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-icon"
                  title="View resume"
                >
                  <ExternalLink size={15} />
                </a>
                <button
                  className="btn-icon btn-icon-danger"
                  onClick={handleResumeDelete}
                  title="Remove resume"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ) : (
            <label className="resume-upload-inline">
              <Upload size={18} />
              <span>{uploading ? 'Uploading...' : 'Upload Resume'}</span>
              <span className="file-hint">PDF, DOC, DOCX — Max 5MB</span>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeUpload}
                className="file-input-hidden"
                disabled={uploading}
              />
            </label>
          )}
        </div>

        {isEditing ? (
          <div className="modal-edit-form">
            <div className="form-group">
              <label>Status</label>
              <div className="pill-selector pill-selector-status">
                {['Applied', 'Interview', 'Offer', 'Rejected', 'No Response'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`pill-option ${formData.status === s ? 'pill-active' : ''}`}
                    onClick={() => setFormData({ ...formData, status: s })}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <div className="pill-selector">
                {[
                  { value: 'High', dot: 'dot-high' },
                  { value: 'Medium', dot: 'dot-medium' },
                  { value: 'Low', dot: 'dot-low' },
                ].map(({ value, dot }) => (
                  <button
                    key={value}
                    type="button"
                    className={`pill-option ${formData.priority === value ? 'pill-active' : ''}`}
                    onClick={() => setFormData({ ...formData, priority: value })}
                  >
                    <span className={`pill-dot ${dot}`} />
                    {value}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Job Posting URL</label>
              <input
                type="url"
                value={formData.jobUrl}
                onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Add notes..."
              />
            </div>
            <div className="modal-edit-actions">
              <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
              <button className="btn btn-ghost" onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            {application.notes && (
              <div className="modal-notes">
                <h4>Notes</h4>
                <p>{application.notes}</p>
              </div>
            )}
          </>
        )}

        {/* Activity Log */}
        <div className="modal-activity">
          <h4><Activity size={16} /> Activity Log</h4>
          <div className="activity-timeline">
            {application.activityLog &&
              [...application.activityLog].reverse().map((log, i) => (
                <div key={i} className="activity-item">
                  <div className="activity-dot" />
                  <div className="activity-content">
                    <span className="activity-action">{log.action}</span>
                    <span className="activity-date">{formatDate(log.date)}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="modal-actions">
          {!isEditing && (
            <>
              <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                Edit Application
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this application?')) {
                    onDelete(application._id);
                  }
                }}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationModal;
