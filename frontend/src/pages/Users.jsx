// ============================================================
// USERS PAGE - Menaxhimi i Perdoruesve (vetem ADMIN)
// ============================================================
import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

const rolet = [
  { v: 'ADMIN', l: 'Administrator' },
  { v: 'MENAXHER', l: 'Menaxher' },
  { v: 'ARKATAR', l: 'Arkatar' },
  { v: 'KAMERIER', l: 'Kamerier' },
];

function ModalPerdoruesi({ perdoruesi, onMbyll, onRuajt }) {
  const [forma, setForma] = useState(
    perdoruesi || { emri: '', username: '', password: '', role: 'KAMERIER' }
  );
  const [dukeRuajtur, setDukeRuajtur] = useState(false);
  const [gabim, setGabim] = useState('');

  async function dorezo(e) {
    e.preventDefault();
    setDukeRuajtur(true);
    setGabim('');
    try {
      await onRuajt(forma);
    } catch (err) {
      setGabim(err.response?.data?.gabim || 'Gabim gjate ruajtjes.');
    } finally {
      setDukeRuajtur(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">{perdoruesi ? 'Edito Perdoruesin' : 'Perdorues i Ri'}</h2>
          <button onClick={onMbyll} className="text-proit-muted hover:text-white"><X size={20} /></button>
        </div>

        {gabim && <div className="bg-red-900/20 border border-red-800 text-red-300 text-sm px-3 py-2 rounded-lg mb-3">{gabim}</div>}

        <form onSubmit={dorezo} className="space-y-3">
          <div>
            <label className="label-field">Emri i Plote</label>
            <input required className="input-field" value={forma.emri} onChange={(e) => setForma({ ...forma, emri: e.target.value })} />
          </div>
          <div>
            <label className="label-field">Username</label>
            <input
              required
              disabled={!!perdoruesi}
              className="input-field disabled:opacity-50"
              value={forma.username}
              onChange={(e) => setForma({ ...forma, username: e.target.value })}
            />
          </div>
          <div>
            <label className="label-field">{perdoruesi ? 'Fjalekalim i Ri (lere bosh per ta lene njejte)' : 'Fjalekalimi'}</label>
            <input
              required={!perdoruesi}
              type="password"
              className="input-field"
              value={forma.password || ''}
              onChange={(e) => setForma({ ...forma, password: e.target.value })}
            />
          </div>
          <div>
            <label className="label-field">Roli</label>
            <select className="input-field" value={forma.role} onChange={(e) => setForma({ ...forma, role: e.target.value })}>
              {rolet.map((r) => <option key={r.v} value={r.v}>{r.l}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onMbyll} className="btn-secondary flex-1 justify-center flex">Anulo</button>
            <button type="submit" disabled={dukeRuajtur} className="btn-primary flex-1 justify-center flex">
              {dukeRuajtur ? 'Duke ruajtur...' : 'Ruaj'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Users() {
  const [perdoruesit, setPerdoruesit] = useState([]);
  const [dukeNgarkuar, setDukeNgarkuar] = useState(true);
  const [modalHapur, setModalHapur] = useState(false);
  const [perdoruesiNeEditim, setPerdoruesiNeEditim] = useState(null);

  useEffect(() => {
    ngarko();
  }, []);

  async function ngarko() {
    setDukeNgarkuar(true);
    const { data } = await api.get('/users');
    setPerdoruesit(data);
    setDukeNgarkuar(false);
  }

  async function ruajPerdoruesin(forma) {
    if (forma.id) {
      await api.put(`/users/${forma.id}`, forma);
    } else {
      await api.post('/users', forma);
    }
    setModalHapur(false);
    setPerdoruesiNeEditim(null);
    ngarko();
  }

  async function fshijPerdoruesin(id) {
    if (!confirm('A jeni te sigurt qe doni ta çaktivizoni kete perdorues?')) return;
    try {
      await api.delete(`/users/${id}`);
      ngarko();
    } catch (err) {
      alert(err.response?.data?.gabim);
    }
  }

  const roliLabel = Object.fromEntries(rolet.map((r) => [r.v, r.l]));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-white">Perdoruesit</h1>
        <button onClick={() => { setPerdoruesiNeEditim(null); setModalHapur(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Perdorues i Ri
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        {dukeNgarkuar ? (
          <div className="p-8 text-center text-proit-muted">Duke u ngarkuar...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-proit-dark border-b border-proit-border">
              <tr className="text-left text-proit-muted">
                <th className="px-4 py-3 font-medium">Emri</th>
                <th className="px-4 py-3 font-medium">Username</th>
                <th className="px-4 py-3 font-medium">Roli</th>
                <th className="px-4 py-3 font-medium text-center">Statusi</th>
                <th className="px-4 py-3 font-medium text-center">Veprime</th>
              </tr>
            </thead>
            <tbody>
              {perdoruesit.map((u) => (
                <tr key={u.id} className="border-b border-proit-border last:border-0">
                  <td className="px-4 py-3 text-white font-medium">{u.emri}</td>
                  <td className="px-4 py-3 text-proit-muted">{u.username}</td>
                  <td className="px-4 py-3 text-white">{roliLabel[u.role]}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`badge ${u.aktiv ? 'bg-proit-lime/20 text-proit-lime' : 'bg-red-900/30 text-red-400'}`}>
                      {u.aktiv ? 'Aktiv' : 'Jo Aktiv'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => { setPerdoruesiNeEditim(u); setModalHapur(true); }} className="text-proit-muted hover:text-proit-lime">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => fshijPerdoruesin(u.id)} className="text-proit-muted hover:text-red-400">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalHapur && (
        <ModalPerdoruesi
          perdoruesi={perdoruesiNeEditim}
          onMbyll={() => { setModalHapur(false); setPerdoruesiNeEditim(null); }}
          onRuajt={ruajPerdoruesin}
        />
      )}
    </div>
  );
}
