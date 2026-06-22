import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Users() {
  const [perdoruesit, setPerdoruesit] = useState([]);
  const [modal, setModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
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
    if (forma.pin && forma.pin.length < 4) {
      setGabim('PIN duhet te kete te pakten 4 karaktere.');
      return;
    }
    setDukeRuajtur(true);
    try {
      const payload = {
        emri: forma.emri,
        role: forma.role,
        pin: forma.pin || null,
        ...(forma.password ? { password: forma.password } : {})
      };
      if (editUser) {
        await api.put(`/users/${editUser.id}`, payload);
      } else {
        await api.post('/users', { ...payload, username: forma.username });
      }
      setModal(false);
      ngarko();
    } catch (err) {
      setGabim(err.response?.data?.gabim || 'Gabim gjate ruajtjes.');
    } finally { setDukeRuajtur(false); }
  }

  async function ndryshoStatus(id, aktiv) {
    await api.put(`/users/${id}`, { aktiv: !aktiv });
    ngarko();
  }

  const roletNgjyra = {
    ADMIN: '#2563eb',
    KAMERIER: '#5a9e0f',
    ARKATAR: '#ea580c',
    MENAXHER: '#7c3aed'
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--tx)' }}>Punonjesit & PIN-et</div>
        <button onClick={() => hapModal()} className="btn-primary">+ Punonjes i Ri</button>
      </div>

      {/* INFO */}
      <div style={{ background: 'rgba(90,158,15,0.06)', border: '1.5px solid rgba(90,158,15,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: 'var(--tx)' }}>
        💡 <strong>Si funksionon lexuesi RFID:</strong> Lexo kartën me Notes/Notepad — merr numrin (p.sh. <code>0012345678</code>) — vendose si PIN të punonjësit. Kur vë kartën te lexuesi, sistemi e njeh automatikisht.
      </div>

      <div className="tabela">
        <table>
          <thead>
            <tr>
              <th>Emri</th>
              <th>Roli</th>
              <th>PIN / Kodi RFID</th>
              <th>Statusi</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {perdoruesit.map(u => (
              <tr key={u.id}>
                <td style={{ fontWeight: 600 }}>{u.emri}</td>
                <td>
                  <span style={{
                    background: `${roletNgjyra[u.role]}18`,
                    color: roletNgjyra[u.role],
                    padding: '2px 10px', borderRadius: 20,
                    fontSize: 11, fontWeight: 700
                  }}>{u.role}</span>
                </td>
                <td>
                  {u.pin
                    ? <span style={{ fontFamily: 'monospace', color: 'var(--lm)', fontWeight: 700 }}>
                        {'•'.repeat(Math.min(u.pin.length, 8))}
                        {u.pin.length > 4 && <span style={{ fontSize: 10, color: 'var(--mt)', marginLeft: 4 }}>({u.pin.length} karaktere)</span>}
                      </span>
                    : <span style={{ color: 'var(--mt)', fontSize: 11 }}>— pa PIN</span>}
                </td>
                <td>
                  <span className={u.aktiv ? 'badge-green' : 'badge-red'}>
                    {u.aktiv ? 'Aktiv' : 'Jo Aktiv'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => hapModal(u)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15 }}>✏️</button>
                    <button onClick={() => ndryshoStatus(u.id, u.aktiv)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15 }}>
                      {u.aktiv ? '🚫' : '✅'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 400 }}>
            <div className="modal-title">
              {editUser ? 'Edito Punonjesin' : 'Punonjes i Ri'}
            </div>

            {gabim && (
              <div style={{ color: 'var(--rd)', fontSize: 12, marginBottom: 10, background: 'rgba(220,38,38,0.08)', padding: '8px 12px', borderRadius: 8 }}>
                {gabim}
              </div>
            )}

            <form onSubmit={ruaj}>
              <div className="form-group">
                <label className="form-label">Emri i Plote *</label>
                <input required value={forma.emri}
                  onChange={e => setForma({ ...forma, emri: e.target.value })}
                  placeholder="p.sh. Agim Krasniqi" />
              </div>

              {!editUser && (
                <div className="form-group">
                  <label className="form-label">Username *</label>
                  <input required value={forma.username}
                    onChange={e => setForma({ ...forma, username: e.target.value })}
                    placeholder="p.sh. agim_k" />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="form-group">
                  <label className="form-label">Roli</label>
                  <select value={forma.role}
                    onChange={e => setForma({ ...forma, role: e.target.value })}>
                    <option>KAMERIER</option>
                    <option>ARKATAR</option>
                    <option>MENAXHER</option>
                    <option>ADMIN</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{editUser ? 'Fjalekalimi i Ri' : 'Fjalekalimi *'}</label>
                  <input type="password" required={!editUser}
                    value={forma.password}
                    onChange={e => setForma({ ...forma, password: e.target.value })}
                    placeholder={editUser ? '(lere bosh)' : '••••••'} />
                </div>
              </div>

              {/* PIN / RFID KOD */}
              <div className="form-group">
                <label className="form-label">PIN ose Kodi RFID *</label>
                <input
                  value={forma.pin}
                  onChange={e => setForma({ ...forma, pin: e.target.value })}
                  placeholder="p.sh. 1234 ose 0012345678 (kod RFID)"
                  style={{ fontFamily: 'monospace', letterSpacing: 2, fontSize: 16, fontWeight: 700 }}
                />
                <div style={{ fontSize: 11, color: 'var(--mt)', marginTop: 5 }}>
                  💡 Për kartë RFID: hape Notes, lexo kartën, merr numrin dhe vendose këtu
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button type="button" onClick={() => setModal(false)} className="btn-secondary" style={{ flex: 1 }}>
                  Anulo
                </button>
                <button type="submit" disabled={duke_ruajtur} className="btn-primary" style={{ flex: 2 }}>
                  {duke_ruajtur ? 'Duke ruajtur...' : '✓ Ruaj'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
