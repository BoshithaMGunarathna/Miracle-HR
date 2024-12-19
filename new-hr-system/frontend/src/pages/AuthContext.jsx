import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for user data on component mount
    const emp_id = localStorage.getItem('emp_id');
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');

    if (emp_id && role && token) {
      setUser({ emp_id, role, token });
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('emp_id', userData.emp_id);
    localStorage.setItem('role', userData.role);
    localStorage.setItem('token', userData.token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('emp_id');
    localStorage.removeItem('role');
    localStorage.removeItem('token');
  };

  if (loading) {
    return <div>Loading...</div>; // Or your loading component
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};