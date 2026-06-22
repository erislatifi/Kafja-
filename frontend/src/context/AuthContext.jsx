import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('kafe_theme') || 'dark';
    setTheme(savedTheme);
    document.body.className = savedTheme === 'light' ? 'theme-light' : '';
    setLoading(false);
  }, []);

  async function loginWithPin(pin) {
    const { data } = await api.post('/auth/login-pin', { pin });
    localStorage.setItem('kafe_nlagje_token', data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('kafe_nlagje_token');
    setUser(null);
  }

  function toggleTheme() {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('kafe_theme', newTheme);
    document.body.className = newTheme === 'light' ? 'theme-light' : '';
  }

  function kaRol(...rolet) {
    return user && rolet.includes(user.role);
  }

  return (
    <AuthContext.Provider value={{ user, loginWithPin, logout, kaRol, loading, theme, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
