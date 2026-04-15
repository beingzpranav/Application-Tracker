import { useState, useEffect } from 'react';
import { Search, Filter, Clock, ChevronDown, ExternalLink, FileText, Plus } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import ApplicationModal from '../components/ApplicationModal';
import { getApplications, updateApplication, deleteApplication } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sort, setSort] = useState('newest');
  const [selectedApp, setSelectedApp] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const { addToast } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, priorityFilter, sort, search]);

  const fetchApplications = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== 'All') params.status = statusFilter;
      if (priorityFilter !== 'All') params.priority = priorityFilter;
      if (sort) params.sort = sort;
      const res = await getApplications(params);
      setApplications(res.data);
    } catch {
      addToast('Failed to load applications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      await updateApplication(id, data);
      addToast('Application updated successfully', 'success');
      fetchApplications();
      setSelectedApp(null);
    } catch {
      addToast('Failed to update application', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteApplication(id);
      addToast('Application deleted', 'success');
      fetchApplications();
      setSelectedApp(null);
    } catch {
      addToast('Failed to delete application', 'error');
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const isFollowUpDue = (app) =>
    app.status === 'Applied' && new Date(app.followUpDate) <= new Date();

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner" />
        <p>Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="applications-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Applications</h1>
          <p className="page-subtitle">{applications.length} total</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/add')}>
          <Plus size={16} /> Add New
        </button>
      </div>

      {/* Search + Filter Toggle Row */}
      <div className="filter-bar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search company or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="search-input"
          />
        </div>
        <button
          className={`btn btn-ghost filter-toggle ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={15} />
          Filters
          <ChevronDown size={13} style={{ transform: showFilters ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
        </button>
      </div>

      {/* Inline Filters */}
      {showFilters && (
        <div className="filter-options">
          <div className="filter-group">
            <label>Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} id="status-filter">
              <option value="All">All Statuses</option>
              {['Applied', 'Interview', 'Offer', 'Rejected', 'No Response'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Priority</label>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} id="priority-filter">
              <option value="All">All Priorities</option>
              {['High', 'Medium', 'Low'].map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Sort By</label>
            <select value={sort} onChange={(e) => setSort(e.target.value)} id="sort-select">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="company">Company A–Z</option>
            </select>
          </div>
        </div>
      )}

      {/* Empty State */}
      {applications.length === 0 ? (
        <div className="page-empty">
          <Search size={48} />
          <h3>No Applications Found</h3>
          <p>{search || statusFilter !== 'All' || priorityFilter !== 'All'
            ? 'Try adjusting your filters'
            : 'Start by adding your first job application!'}</p>
        </div>
      ) : (
        <>
          {/* ── Desktop Table ── */}
          <div className="table-wrapper desktop-table">
            <table className="app-table" id="applications-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Applied</th>
                  <th>Links</th>
                  <th>Follow-up</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr
                    key={app._id}
                    className={`table-row ${isFollowUpDue(app) ? 'row-followup' : ''}`}
                    onClick={() => setSelectedApp(app)}
                  >
                    <td className="td-company">
                      <div className="company-avatar">{app.company.charAt(0).toUpperCase()}</div>
                      <span>{app.company}</span>
                    </td>
                    <td className="td-role">{app.role}</td>
                    <td><StatusBadge status={app.status} /></td>
                    <td><PriorityBadge priority={app.priority} /></td>
                    <td className="td-date">{formatDate(app.dateApplied)}</td>
                    <td className="td-links">
                      {app.jobUrl && (
                        <a href={app.jobUrl} target="_blank" rel="noopener noreferrer"
                          className="table-link-icon" title="Job Posting" onClick={(e) => e.stopPropagation()}>
                          <ExternalLink size={15} />
                        </a>
                      )}
                      {app.resumeUrl && (
                        <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer"
                          className="table-link-icon table-resume-icon" title="Resume" onClick={(e) => e.stopPropagation()}>
                          <FileText size={15} />
                        </a>
                      )}
                    </td>
                    <td className="td-followup">
                      {isFollowUpDue(app) ? (
                        <span className="followup-due"><Clock size={13} /> Due</span>
                      ) : (
                        <span className="followup-pending">{formatDate(app.followUpDate)}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Mobile Cards ── */}
          <div className="mobile-cards">
            {applications.map((app) => (
              <div
                key={app._id}
                className={`app-card ${isFollowUpDue(app) ? 'app-card-followup' : ''}`}
                onClick={() => setSelectedApp(app)}
              >
                <div className="app-card-header">
                  <div className="app-card-company">
                    <div className="company-avatar">{app.company.charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="app-card-company-name">{app.company}</div>
                      <div className="app-card-role">{app.role}</div>
                    </div>
                  </div>
                  <div className="app-card-badges">
                    <StatusBadge status={app.status} />
                    <PriorityBadge priority={app.priority} />
                  </div>
                </div>

                <div className="app-card-meta">
                  <span className="app-card-date">
                    <Clock size={12} /> {formatDate(app.dateApplied)}
                  </span>
                  {isFollowUpDue(app) && (
                    <span className="followup-due"><Clock size={12} /> Follow-up due</span>
                  )}
                  <div className="app-card-links" onClick={(e) => e.stopPropagation()}>
                    {app.jobUrl && (
                      <a href={app.jobUrl} target="_blank" rel="noopener noreferrer" className="table-link-icon" title="Job Posting">
                        <ExternalLink size={14} />
                      </a>
                    )}
                    {app.resumeUrl && (
                      <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className="table-link-icon table-resume-icon" title="Resume">
                        <FileText size={14} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {selectedApp && (
        <ApplicationModal
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default Applications;
