import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('jt_token'));

  const logout = useCallback(() => {
    localStorage.removeItem('jt_token');
    setToken(null);
    setUser(null);
  }, []);

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
      } else if (res.status === 401) {
        logout();
        return false;
      }
      return false;
    } catch (error) {
      console.error('Network error during fetchUser', error);
      // Do not logout on network errors, the backend might just be down temporarily
      return false;
    }
  }, [logout]);

  useEffect(() => {
    if (token) {
      fetchUser(token).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token, fetchUser]);

  const login = useCallback(async (jwt) => {
    localStorage.setItem('jt_token', jwt);
    setToken(jwt);
    const ok = await fetchUser(jwt);
    if (!ok) {
      localStorage.removeItem('jt_token');
      setToken(null);
      setUser(null);
    }
    return ok;
  }, [fetchUser]);

  const loginWithPassword = useCallback(async ({ usernameOrEmail, password }) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernameOrEmail, password }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }

    await login(data.token);
    return data;
  }, [login]);

  const registerWithPassword = useCallback(async ({ name, email, username, password }) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, username, password }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    await login(data.token);
    return data;
  }, []);

  const updateUser = useCallback((newData) => {
    setUser((prev) => ({ ...prev, ...newData }));
  }, []);

  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        login,
        loginWithPassword,
        registerWithPassword,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
