import { useState, useEffect } from 'react';
import { Bell, Clock, AlertTriangle, ExternalLink } from 'lucide-react';
import { getNotifications } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { addToast } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data);
    } catch (error) {
      addToast('Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'all') return true;
    return n.type === filter;
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner" />
        <p>Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="page-header">
        <div>
          <h1>Alerts & Notifications</h1>
          <p className="page-subtitle">
            {notifications.length} active alert{notifications.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="notif-tabs">
        <button
          className={`notif-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({notifications.length})
        </button>
        <button
          className={`notif-tab ${filter === 'follow-up' ? 'active' : ''}`}
          onClick={() => setFilter('follow-up')}
        >
          <Clock size={14} /> Follow-ups (
          {notifications.filter((n) => n.type === 'follow-up').length})
        </button>
        <button
          className={`notif-tab ${filter === 'stale' ? 'active' : ''}`}
          onClick={() => setFilter('stale')}
        >
          <AlertTriangle size={14} /> Stale Warnings (
          {notifications.filter((n) => n.type === 'stale').length})
        </button>
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <div className="page-empty">
          <Bell size={48} />
          <h3>No Alerts</h3>
          <p>You're all caught up! No pending follow-ups or stale warnings.</p>
        </div>
      ) : (
        <div className="notif-grid">
          {filtered.map((notif, i) => (
            <div
              key={i}
              className={`notif-card notif-${notif.type}`}
              onClick={() => navigate('/applications')}
            >
              <div className="notif-card-icon">
                {notif.type === 'follow-up' ? (
                  <Clock size={22} />
                ) : (
                  <AlertTriangle size={22} />
                )}
              </div>
              <div className="notif-card-content">
                <h4>{notif.company}</h4>
                <p className="notif-card-role">{notif.role}</p>
                <p className="notif-card-message">{notif.message}</p>
                <span className="notif-card-date">{formatDate(notif.date)}</span>
              </div>
              <ExternalLink size={16} className="notif-card-arrow" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
