import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  Briefcase, Users, Trophy, XCircle, Clock, AlertTriangle,
  TrendingUp, Target, Bell,
} from 'lucide-react';
import StatsCard from '../components/StatsCard';
import { getStats, getNotifications } from '../services/api';
import { useNotifications } from '../context/NotificationContext';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useNotifications();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, notifRes] = await Promise.all([getStats(), getNotifications()]);
      setStats(statsRes.data);
      setNotifications(notifRes.data);
    } catch (error) {
      addToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="page-empty">
        <Briefcase size={48} />
        <h3>No Data Yet</h3>
        <p>Start by adding your first job application!</p>
      </div>
    );
  }

  const statsCards = [
    { title: 'Total Applications', value: stats.total, icon: Briefcase, color: '#6366f1' },
    { title: 'Interviews', value: stats.interviews, icon: Users, color: '#f59e0b' },
    { title: 'Offers', value: stats.offers, icon: Trophy, color: '#10b981' },
    { title: 'Rejections', value: stats.rejections, icon: XCircle, color: '#ef4444' },
    { title: 'Response Rate', value: `${stats.responseRate}%`, icon: TrendingUp, color: '#8b5cf6' },
    { title: 'Offer Rate', value: `${stats.offerRate}%`, icon: Target, color: '#06b6d4' },
  ];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent === 0) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">Your job search at a glance</p>
        </div>
      </div>

      {/* Alert Banner */}
      {(stats.followUpAlerts > 0 || stats.staleWarnings > 0) && (
        <div className="alert-banner">
          {stats.followUpAlerts > 0 && (
            <div className="alert-item alert-followup">
              <Clock size={18} />
              <span>{stats.followUpAlerts} application(s) need follow-up</span>
            </div>
          )}
          {stats.staleWarnings > 0 && (
            <div className="alert-item alert-stale">
              <AlertTriangle size={18} />
              <span>{stats.staleWarnings} application(s) with no response in 10+ days</span>
            </div>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid">
        {statsCards.map((card) => (
          <StatsCard key={card.title} {...card} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        <div className="chart-card">
          <h3>Weekly Applications</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="week" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  color: '#e2e8f0',
                }}
              />
              <Bar dataKey="applications" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#4f46e5" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Status Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={stats.statusDistribution.filter((d) => d.value > 0)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                innerRadius={50}
                dataKey="value"
                stroke="none"
              >
                {stats.statusDistribution
                  .filter((d) => d.value > 0)
                  .map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  color: '#e2e8f0',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <div className="notifications-preview">
          <h3><Bell size={18} /> Recent Alerts</h3>
          <div className="notification-list">
            {notifications.slice(0, 5).map((notif, i) => (
              <div key={i} className={`notification-item notif-${notif.type}`}>
                {notif.type === 'follow-up' ? <Clock size={16} /> : <AlertTriangle size={16} />}
                <div className="notif-content">
                  <span className="notif-message">{notif.message}</span>
                  <span className="notif-date">
                    {new Date(notif.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
