import React, { useState } from 'react';
import Login from './components/auth/Login';
import Logout from './components/auth/Logout';
import Register from './components/auth/Register';
import Form from './components/Form'; 
import Contact from './components/Contact'; 
import ContactsPage from './components/ContactsPage';
import Preferences from './components/Preferences';
import { Route, Routes } from 'react-router-dom';
import AppNavbar from './components/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import About from './components/About';


function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [username, setUsername] = useState(() => localStorage.getItem('username'));

  const saveToken = (userToken, userName) => {
    localStorage.setItem('token', userToken);
    localStorage.setItem('username', userName);    
    setToken(userToken);
    setUsername(userName);
  };

  return (
    <div className="wrapper">
      <AppNavbar username={username} token={token} />

      <Routes>   
        {/* Public Routes */}
        <Route path="/" element={<About />} />
        <Route path="/login" element={<Login setToken={saveToken} />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        {token && (
          <>
            <Route path="/newContact" element={<Form token={token} />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/preferences" element={<Preferences />} />
            <Route path="/logout" element={<Logout setToken={setToken} />} />
            <Route path="/contacts" element={<ContactsPage token={token} />} />
          </>
        )}

        {/* Redirect if not authenticated */}
        {!token && (
          <>
            <Route path="/newContact" element={<Login setToken={saveToken} />} />
            <Route path="/contact" element={<Login setToken={saveToken} />} />
            <Route path="/preferences" element={<Login setToken={saveToken} />} />
            <Route path="/logout" element={<Login setToken={saveToken} />} />
            <Route path="/contacts" element={<Login setToken={saveToken} />} />
          </>
        )}
      </Routes>
    </div>
  );
}


export default App;