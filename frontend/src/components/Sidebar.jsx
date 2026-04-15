import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, PlusCircle, Bell, Briefcase } from 'lucide-react';

const Sidebar = ({ notificationCount }) => {
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/applications', icon: ClipboardList, label: 'Applications' },
    { to: '/add', icon: PlusCircle, label: 'Add New' },
    { to: '/notifications', icon: Bell, label: 'Alerts', badge: notificationCount },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Briefcase size={24} />
        </div>
        <div className="brand-text">
          <h1>JobTracker</h1>
          <span>Smart Application Manager</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={20} />
            <span>{label}</span>
            {badge > 0 && <span className="nav-badge">{badge}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-version">v1.0 MVP</div>
      </div>
    </aside>
  );
};

export default Sidebar;
