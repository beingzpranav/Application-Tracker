import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, Upload, X, Link, FileText } from 'lucide-react';
import { createApplication } from '../services/api';
import { useNotifications } from '../context/NotificationContext';

const AddApplication = () => {
  const navigate = useNavigate();
  const { addToast } = useNotifications();
  const [submitting, setSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    dateApplied: new Date().toISOString().split('T')[0],
    priority: 'Medium',
    status: 'Applied',
    notes: '',
    jobUrl: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      if (!allowedTypes.includes(file.type)) {
        addToast('Only PDF, DOC, and DOCX files are allowed', 'warning');
        e.target.value = '';
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        addToast('File size must be less than 5MB', 'warning');
        e.target.value = '';
        return;
      }
      setResumeFile(file);
    }
  };

  const removeFile = () => {
    setResumeFile(null);
    // Reset file input
    const fileInput = document.getElementById('resume');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.company.trim() || !formData.role.trim()) {
      addToast('Please fill in all required fields', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = { ...formData };
      if (resumeFile) {
        payload.resume = resumeFile;
      }
      await createApplication(payload);
      addToast(`Application for ${formData.company} added successfully!`, 'success');
      navigate('/applications');
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to add application', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-page">
      <div className="page-header">
        <div>
          <button className="btn btn-ghost back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Back
          </button>
          <h1>Add Application</h1>
          <p className="page-subtitle">Track a new job application</p>
        </div>
      </div>

      <form className="add-form" onSubmit={handleSubmit}>
        <div className="form-card">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="company">Company Name *</label>
              <input
                id="company"
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="e.g., Google, Microsoft..."
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">Role / Position *</label>
              <input
                id="role"
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="e.g., Software Engineer Intern..."
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="dateApplied">Date Applied *</label>
              <input
                id="dateApplied"
                type="date"
                name="dateApplied"
                value={formData.dateApplied}
                onChange={handleChange}
                required
              />
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

          </div>

          <div className="form-group form-full">
            <label>Initial Status</label>
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

          <div className="form-group form-full">
            <label htmlFor="jobUrl">
              <Link size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Job Posting URL
            </label>
            <input
              id="jobUrl"
              type="url"
              name="jobUrl"
              value={formData.jobUrl}
              onChange={handleChange}
              placeholder="https://careers.google.com/jobs/..."
            />
          </div>

          <div className="form-group form-full">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional notes, recruiter contact, job link..."
              rows={4}
            />
          </div>

          {/* Resume Upload */}
          <div className="form-group form-full">
            <label htmlFor="resume">
              <FileText size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Resume (Optional)
            </label>
            <div className="file-upload-area">
              {resumeFile ? (
                <div className="file-selected">
                  <div className="file-selected-info">
                    <FileText size={20} />
                    <div>
                      <span className="file-name">{resumeFile.name}</span>
                      <span className="file-size">
                        {(resumeFile.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  </div>
                  <button type="button" className="file-remove" onClick={removeFile}>
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label htmlFor="resume" className="file-drop-zone">
                  <Upload size={24} />
                  <span>Click to upload resume</span>
                  <span className="file-hint">PDF, DOC, DOCX — Max 5MB</span>
                  <input
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="file-input-hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="form-info">
            <p>📅 Follow-up reminder will be automatically set for 5 days after the application date.</p>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
              <Send size={18} />
              {submitting ? 'Adding...' : 'Add Application'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddApplication;
