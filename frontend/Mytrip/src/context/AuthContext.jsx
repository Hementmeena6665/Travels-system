import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // We could fetch user details based on the token if the backend provides an endpoint,
  // but for now, we'll decode the token or just keep it simple.
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
       // Ideally we would verify the token here
       setUser({ token: token });
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const response = await api.post('login/', { username, password });
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    setUser({ token: response.data.access });
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  const register = async (userData) => {
     await api.post('register/', userData);
     // Auto-login after register could be done here, or redirect
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
        {!loading && children}
    </AuthContext.Provider>
  );
};
