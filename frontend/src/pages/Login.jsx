// ============================================================
// LOGIN PAGE
// ============================================================
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Coffee, Lock, User, AlertCircle } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [gabim, setGabim] = useState('');
  const [dukeNgarkuar, setDukeNgarkuar] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function dorezoFormen(e) {
    e.preventDefault();
    setGabim('');
    setDukeNgarkuar(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setGabim(err.response?.data?.gabim || 'Gabim ne kycje. Provoni perseri.');
    } finally {
      setDukeNgarkuar(false);
    }
  }

  return (
    <div className="min-h-screen bg-proit-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-proit-lime flex items-center justify-center mx-auto mb-4">
            <Coffee size={32} className="text-proit-black" />
          </div>
          <h1 className="text-2xl font-bold text-white">Kafe Nlagje</h1>
          <p className="text-proit-muted text-sm mt-1">Sistemi i Menaxhimit</p>
        </div>

        <form onSubmit={dorezoFormen} className="card space-y-4">
          {gabim && (
            <div className="flex items-center gap-2 bg-red-900/20 border border-red-800 text-red-300 text-sm px-3 py-2.5 rounded-lg">
              <AlertCircle size={16} className="shrink-0" />
              {gabim}
            </div>
          )}

          <div>
            <label className="label-field">Username</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-proit-muted" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field pl-9"
                placeholder="p.sh. admin"
                required
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="label-field">Fjalekalimi</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-proit-muted" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-9"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button type="submit" disabled={dukeNgarkuar} className="btn-primary w-full justify-center flex items-center">
            {dukeNgarkuar ? 'Duke u kycur...' : 'Kyçu'}
          </button>
        </form>

        <p className="text-center text-xs text-proit-muted mt-6">
          Powered by <span className="text-proit-lime font-semibold">PRO IT</span> | prs-ks.com
        </p>
      </div>
    </div>
  );
}
