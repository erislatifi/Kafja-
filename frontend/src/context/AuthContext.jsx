// ============================================================
// AUTH CONTEXT - Menaxhimi i sesionit dhe rolit te perdoruesit
// ============================================================
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [duke_u_ngarkuar, setDukeUNgarkuar] = useState(true);

  useEffect(() => {
    const userIRuajtur = localStorage.getItem('kafe_nlagje_user');
    const token = localStorage.getItem('kafe_nlagje_token');
    if (userIRuajtur && token) {
      setUser(JSON.parse(userIRuajtur));
    }
    setDukeUNgarkuar(false);
  }, []);

  async function login(username, password) {
    const { data } = await api.post('/auth/login', { username, password });
    localStorage.setItem('kafe_nlagje_token', data.token);
    localStorage.setItem('kafe_nlagje_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('kafe_nlagje_token');
    localStorage.removeItem('kafe_nlagje_user');
    setUser(null);
  }

  function kaRol(...rolet) {
    return user && rolet.includes(user.role);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, kaRol, duke_u_ngarkuar }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth duhet perdorur brenda AuthProvider');
  return ctx;
}
