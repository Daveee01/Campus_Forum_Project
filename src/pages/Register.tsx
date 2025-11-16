import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function Register() {
  const navigate = useNavigate();

  useEffect(() => {
    // Register page is deprecated - use AuthModal instead
    navigate('/');
  }, [navigate]);

  return <div className="text-center py-12 text-gray-400">Redirecting...</div>;
}
