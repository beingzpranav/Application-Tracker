import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('jt_token'));

  // Fetch user info from token
  const fetchUser = useCallback(async (jwt) => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        return true;
      } else {
        logout();
        return false;
      }
    } catch {
      logout();
      return false;
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchUser(token).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token, fetchUser]);

  const login = useCallback((jwt) => {
    localStorage.setItem('jt_token', jwt);
    setToken(jwt);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('jt_token');
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
