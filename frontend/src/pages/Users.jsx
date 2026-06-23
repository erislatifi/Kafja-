import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Users() {
  const [perdoruesit, setPerdoruesit] = useState([]);
  const [modal, setModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [konfirmFshij, setKonfirmFshij] = useState(null);
  const [forma, setForma] = useState({ emri: '', username: '', password: '', pin: '', role: 'KAMERIER' });
  const [gabim, setGabim] = useState('');
  const [duke_ruajtur, setDukeRuajtur] = useState(false);

  useEffect(() => { ngarko(); }, []);

  async function ngarko() {
    try { const { data } = await api.get('/users'); setPerdoruesit(data); } catch { }
  }

  function hapModal(u = null) {
    setEditUser(u);
    setForma(u
      ? { emri: u.emri, username: u.username, password: '', pin: u.pin || '', role: u.role }
      : { emri: '', username: '', password: '', pin: '', role: 'KAMERIER' });
    setGabim('');
    setModal(true);
  }

  async function ruaj(e) {
    e.preventDefault();
    setGabim('');
    if (forma.pin && forma.pin.length < 4) { setGabim('PIN duhet të ketë të paktën 4 karaktere.'); return; }
    setDukeRuajtur(true);
    try {
      const payload = { emri: forma.emri, role: forma.role, pin: forma.pin || null, ...(forma.password ? { password: forma.password } : {}) };
      if (editUser) await api.put(`/users/${editUser.id}`, payload);
      else await api.post('/users', { ...payload, username: forma.username });
      setModal(false); ngarko();
    } catch (err) { setGabim(err.response?.data?.gabim || 'Gabim.'); }
    finally { setDukeRuajtur(false); }
  }

  async function ndryshoStatus(id, aktiv) {
    await api.put(`/users/${id}`, { aktiv: !aktiv }); ngarko();
  }

  async function fshijPerdoruesin(id) {
    await api.delete(`/users/${id}`); setKonfirmFshij(null); ngarko();
  }

  const roletNgjyra = { ADMIN: '#2563eb', KAMERIER: '#5a9e0f', ARKATAR: '#ea580c', MENAXHER: '#7c3aed' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--tx)' }}>Punonjesit & PIN-et</div>
        <button onClick={() => hapModal()} className="btn-primary">+ Punonjes i Ri</button>
      </div>

      <div style={{ background: 'rgba(90,158,15,0.06)', border: '1.5px solid rgba(90,158,15,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: 'var(--tx)' }}>
        💡 <strong>PIN ose Kodi RFID:</strong> Për kartë RFID hapni Notepad, lexoni kartën, merrni numrin (p.sh. 0008115963) dhe vendoseni si PIN.
      </div>

      <div className="tabela">
        <table>
          <thead>
            <tr><th>Emri</th><th>Roli</th><th>PIN / RFID</th><th>Statusi</th><th>Veprime</th></tr>
          </thead>
          <tbody>
            {perdoruesit.map(u => (
              <tr key={u.id}>
                <td style={{ fontWeight: 600 }}>{u.emri}</td>
                <td>
                  <span style={{ background: `${roletNgjyra[u.role]}18`, color: roletNgjyra[u.role], padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                    {u.role}
                  </span>
                </td>
                <td>
                  {u.pin
                    ? <span style={{ fontFamily: 'monospace', color: 'var(--lm)', fontWeight: 700 }}>
                        {'•'.repeat(Math.min(u.pin.length, 8))}
                        {u.pin.length > 4 && <span style={{ fontSize: 10, color: 'var(--mt)', marginLeft: 4 }}>({u.pin.length} kar.)</span>}
                      </span>
                    : <span style={{ color: 'var(--mt)', fontSize: 11 }}>— pa PIN</span>}
                </td>
                <td>
                  <span className={u.aktiv ? 'badge-green' : 'badge-red'}>
                    {u.aktiv ? 'Aktiv' : 'Jo Aktiv'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {/* Edito */}
                    <button onClick={() => hapModal(u)} title="Edito"
                      style={{ background: 'var(--bg3)', border: '1px solid var(--bd)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 14 }}>✏️</button>
                    {/* Aktivo/Deaktivo */}
                    <button onClick={() => ndryshoStatus(u.id, u.aktiv)} title={u.aktiv ? 'Deaktivo' : 'Aktivo'}
                      style={{ background: u.aktiv ? 'rgba(234,88,12,0.08)' : 'rgba(90,158,15,0.08)', border: `1px solid ${u.aktiv ? 'rgba(234,88,12,0.3)' : 'rgba(90,158,15,0.3)'}`, borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 14 }}>
                      {u.aktiv ? '🚫' : '✅'}
                    </button>
                    {/* Fshij */}
                    <button onClick={() => setKonfirmFshij(u)} title="Fshij"
                      style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 14 }}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL EDITO/SHTO */}
      {modal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 400 }}>
            <div className="modal-title">{editUser ? 'Edito Punonjesin' : 'Punonjes i Ri'}</div>
            {gabim && <div style={{ color: 'var(--rd)', fontSize: 12, marginBottom: 10, background: 'rgba(220,38,38,0.08)', padding: '8px 12px', borderRadius: 8 }}>{gabim}</div>}
            <form onSubmit={ruaj}>
              <div className="form-group">
                <label className="form-label">Emri i Plote *</label>
                <input required value={forma.emri} onChange={e => setForma({ ...forma, emri: e.target.value })} placeholder="p.sh. Agim Krasniqi" />
              </div>
              {!editUser && (
                <div className="form-group">
                  <label className="form-label">Username *</label>
                  <input required value={forma.username} onChange={e => setForma({ ...forma, username: e.target.value })} placeholder="p.sh. agim_k" />
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="form-group">
                  <label className="form-label">Roli</label>
                  <select value={forma.role} onChange={e => setForma({ ...forma, role: e.target.value })}>
                    <option>KAMERIER</option><option>ARKATAR</option><option>MENAXHER</option><option>ADMIN</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{editUser ? 'Fjalekalimi i Ri' : 'Fjalekalimi *'}</label>
                  <input type="password" required={!editUser} value={forma.password}
                    onChange={e => setForma({ ...forma, password: e.target.value })}
                    placeholder={editUser ? '(lere bosh)' : '••••••'} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">PIN ose Kodi RFID *</label>
                <input value={forma.pin} onChange={e => setForma({ ...forma, pin: e.target.value })}
                  placeholder="p.sh. 1234 ose 0008115963 (RFID)"
                  style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 700, letterSpacing: 2 }} />
                <div style={{ fontSize: 11, color: 'var(--mt)', marginTop: 4 }}>
                  Për RFID: hape Notepad, lexo kartën, merr numrin
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button type="button" onClick={() => setModal(false)} className="btn-secondary" style={{ flex: 1 }}>Anulo</button>
                <button type="submit" disabled={duke_ruajtur} className="btn-primary" style={{ flex: 2 }}>
                  {duke_ruajtur ? 'Duke ruajtur...' : '✓ Ruaj'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* KONFIRMIM FSHIRJE */}
      {konfirmFshij && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 340, textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🗑️</div>
            <div className="modal-title">Fshij Punonjesin?</div>
            <div style={{ fontSize: 13, color: 'var(--mt)', marginBottom: 20 }}>
              A jeni të sigurt që doni ta fshini <strong style={{ color: 'var(--tx)' }}>{konfirmFshij.emri}</strong>?
              Ky veprim nuk mund të kthehet mbrapsht.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setKonfirmFshij(null)} className="btn-secondary" style={{ flex: 1 }}>Anulo</button>
              <button onClick={() => fshijPerdoruesin(konfirmFshij.id)}
                style={{ flex: 1, padding: 10, background: 'var(--rd)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                🗑️ Fshij
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
