
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
    
      console.log('loginUser response:', tokenData); // <-- válasz naplózása
    
      if (tokenData?.error) {
        setError(`Szerver hiba: ${tokenData.error}`);
      } else {
        setToken(tokenData.token, tokenData.username); 
        navigate('/contacts'); 
      }
    } catch (err) {
      console.error('Hiba történt a bejelentkezés során:', err);
    
      // Kibővített hibakezelés
      let message = 'Hiba történt a bejelentkezés során.';
      if (err instanceof Error) {
        message += ` Részletek: ${err.message}`;
      }
      
      // Ha a hiba egy HTTP válasz (pl. fetch sikertelen válasz), az is kiolvasható
      if (err?.response) {
        message += `\nHTTP státusz: ${err.response.status}`;
        message += `\nVálasz: ${JSON.stringify(await err.response.json(), null, 2)}`;
      }
    
      setError(message);
    }
  };
  async function loginUser(credentials) {
    const apiUrl = process.env.REACT_APP_API_URL;
  
    try {
      const response = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });
  
      const responseBody = await response.text(); // Először szövegként olvasd ki, hogy bármilyen válasz olvasható legyen (pl. HTML error page)
      let data;
  
      try {
        data = JSON.parse(responseBody); // Próbáld JSON-ként értelmezni
      } catch (jsonError) {
        alert(jsonError);
        alert(responseBody);
        console.warn('Nem JSON válasz:', responseBody);
        throw new Error(`Nem JSON válasz: ${responseBody}`);
      }
  
      if (!response.ok) {
        // Pl. 401 Unauthorized, 500 Internal Server Error, stb.
        throw new Error(`Hibás státuszkód: ${response.status} - ${data.error || response.statusText}`);
      }
  
      console.log('Sikeres válasz:', data);
      return data;
    } catch (error) {
      console.error('loginUser hiba:', error);
      alert(error)
      throw error; // Fontos, hogy ezt továbbdobd a hívó oldalra
    }
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
