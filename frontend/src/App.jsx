import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ToastContainer from './components/ToastContainer';
import Dashboard from './pages/Dashboard';
import Applications from './pages/Applications';
import AddApplication from './pages/AddApplication';
import ApplicationDetails from './pages/ApplicationDetails';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import LandingPage from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { getNotifications } from './services/api';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
          <div className="skeleton" style={{ width: '120px', height: '32px' }}></div>
          <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '50%' }}></div>
        </div>
        <div className="skeleton skeleton-title" style={{ width: '250px' }}></div>
        <div className="skeleton-grid">
          <div className="skeleton skeleton-card"></div>
          <div className="skeleton skeleton-card"></div>
          <div className="skeleton skeleton-card"></div>
          <div className="skeleton skeleton-card"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppContent () {
  const { isAuthenticated } = useAuth();
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchCount = async () => {
      try {
        const res = await getNotifications();
        setNotificationCount(res.data.length);
      } catch {
        // silently fail
      }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const appLayout = (page) => (
    <ProtectedRoute>
      <div className="app-layout">
        <Navbar notificationCount={notificationCount} />
        <main className="main-content">
          <div className="content-container">{page}</div>
        </main>
        <ToastContainer />
      </div>
    </ProtectedRoute>
  );

  return (
    <Routes>
      {/* Public — landing page lives at the real root URL */}
      <Route path="/" element={<LandingPage />} />

      {/* Legacy /login redirect → / so old bookmarks / Google OAuth still work */}
      <Route path="/login" element={<Navigate to="/" replace />} />

      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />

      {/* Protected app routes */}
      <Route path="/dashboard" element={appLayout(<Dashboard />)} />
      <Route path="/applications" element={appLayout(<Applications />)} />
      <Route path="/applications/:id" element={appLayout(<ApplicationDetails />)} />
      <Route path="/add" element={appLayout(<AddApplication />)} />
      <Route path="/notifications" element={appLayout(<Notifications />)} />
      <Route path="/profile" element={appLayout(<Profile />)} />

      {/* Catch-all: send unknown paths back to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App () {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <AppContent />
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
