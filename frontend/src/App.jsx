import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ToastContainer from './components/ToastContainer';
import Dashboard from './pages/Dashboard';
import Applications from './pages/Applications';
import AddApplication from './pages/AddApplication';
import Notifications from './pages/Notifications';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { getNotifications } from './services/api';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-loading" style={{ minHeight: '100vh' }}>
        <div className="loading-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function AppContent() {
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

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <div className="app-layout">
              <Navbar notificationCount={notificationCount} />
              <main className="main-content">
                <div className="content-container">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/applications" element={<Applications />} />
                    <Route path="/add" element={<AddApplication />} />
                    <Route path="/notifications" element={<Notifications />} />
                  </Routes>
                </div>
              </main>
              <ToastContainer />
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
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
