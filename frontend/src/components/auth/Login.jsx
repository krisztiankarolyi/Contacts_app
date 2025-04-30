
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import env from "react-dotenv";



function Login({ setToken }) {
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/'); 
    }
  }, [navigate]);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    try {
      const tokenData = await loginUser({ username, password });
      if (tokenData?.error) {
        setError(tokenData.error);
      } else {
        setToken(tokenData.token, tokenData.username); 
        navigate('/contacts'); 
      }
    } catch {
      setError('Hiba történt a bejelentkezés során.');
    }
  };

  async function loginUser(credentials) {
    const apiUrl = process.env.REACT_APP_API_URL;

    const response = await fetch(apiUrl+'/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    return await response.json();
  }

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <form className="card p-4" style={{ width: '300px' }} onSubmit={handleSubmit}>
        <h2 className="text-center mb-4">Login</h2>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div className="mb-3">
          <label htmlFor="username" className="form-label">Username</label>
          <input
            type="text"
            id="username"
            onChange={e => setUserName(e.target.value)}
            value={username}
            className="form-control"
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            id="password"
            onChange={e => setPassword(e.target.value)}
            value={password}
            className="form-control"
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-100">
          Login
        </button>
        <br></br>
        <p>Don't have an account? <a href="/register">Sign up!</a></p>
      </form>
    </div>
  );
}

export default Login;

Login.propTypes = {
  setToken: PropTypes.func.isRequired
};
