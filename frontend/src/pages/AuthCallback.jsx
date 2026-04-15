import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      login(token);
      navigate('/', { replace: true });
    } else {
      navigate('/login?error=no_token', { replace: true });
    }
  }, [searchParams, login, navigate]);

  return (
    <div className="page-loading">
      <div className="loading-spinner" />
      <p>Signing you in...</p>
    </div>
  );
};

export default AuthCallback;
