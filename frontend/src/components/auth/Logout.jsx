import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Logout({ setToken }) {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/login');
  }, [setToken, navigate]);

  return null; // Nem jelenít meg semmit
}