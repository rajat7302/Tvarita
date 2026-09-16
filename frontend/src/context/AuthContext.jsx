import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('tvarita_user');
    const storedToken = localStorage.getItem('tvarita_token');
    const guestMode = localStorage.getItem('tvarita_guest');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setIsGuest(false);
    } else if (guestMode === 'true') {
      setIsGuest(true);
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('tvarita_user', JSON.stringify(userData));
    localStorage.setItem('tvarita_token', token);
    localStorage.removeItem('tvarita_guest');
    setUser(userData);
    setIsGuest(false);
  };

  const updateUser = (userData) => {
    localStorage.setItem('tvarita_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('tvarita_user');
    localStorage.removeItem('tvarita_token');
    localStorage.removeItem('tvarita_guest');
    setUser(null);
    setIsGuest(true);
  };

  const continueAsGuest = () => {
    localStorage.setItem('tvarita_guest', 'true');
    setIsGuest(true);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isGuest, loading, login, updateUser, logout, continueAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
};