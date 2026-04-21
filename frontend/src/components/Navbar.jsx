import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, PlusCircle, Bell, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ notificationCount }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/applications', icon: ClipboardList, label: 'Applications' },
    { to: '/add', icon: PlusCircle, label: 'Add New' },
    { to: '/notifications', icon: Bell, label: 'Alerts', badge: notificationCount },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="floating-navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <NavLink to="/dashboard" className="navbar-brand">
          <img src="/Logo.png" alt="JobTracker" className="navbar-logo" />
          <span className="brand-name">JobTracker</span>
        </NavLink>

        {/* Nav Links */}
        <div className="navbar-links">
          {navItems.map(({ to, icon: Icon, label, badge }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={17} />
              <span>{label}</span>
              {badge > 0 && <span className="navbar-badge">{badge}</span>}
            </NavLink>
          ))}
        </div>

        {/* User Section */}
        <div className="navbar-user" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <NavLink to="/profile" className="navbar-user-link" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', padding: '4px 8px', borderRadius: '4px', transition: 'background 0.2s' }}>
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="navbar-avatar" referrerPolicy="no-referrer" style={{ border: '2px solid var(--accent-green)', padding: '2px', width: '32px', height: '32px' }} />
            ) : (
              <div className="navbar-avatar-placeholder" style={{ border: '2px solid var(--accent-green)', padding: '2px', width: '32px', height: '32px', backgroundClip: 'content-box' }}>
                {user?.name?.charAt(0) || '?'}
              </div>
            )}
            <span className="navbar-username" style={{ color: 'var(--text-primary)' }}>{user?.username || user?.name?.split(' ')[0]}</span>
          </NavLink>
          <button className="navbar-logout" onClick={handleLogout} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
