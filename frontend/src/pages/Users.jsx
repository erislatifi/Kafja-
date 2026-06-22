import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

export default function Users() {
  const [perdoruesit, setPerdoruesit] = useState([]);
  const [modal, setModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [forma, setForma] = useState({ emri: '', username: '', password: '', pin: '', rfidKod: '', role: 'KAMERIER' });
  const [gabim, setGabim] = useState('');
  const [duke_ruajtur, setDukeRuajtur] = useState(false);
  const [duke_lexuar_rfid, setDukeLexuarRfid] = useState(false);
  const rfidBuffer = useRef('');
  const rfidTimer = useRef(null);

  useEffect(() => { ngarko(); }, []);

  // RFID lexim per regjistrim karte te re
  useEffect(() => {
    if (!duke_lexuar_rfid) return;
    function onKey(e) {
      if (e.key === 'Enter') {
        if (rfidBuffer.current.length >= 4) {
          setForma(f => ({ ...f, rfidKod: rfidBuffer.current }));
          setDukeLexuarRfid(false);
        }
        rfidBuffer.current = '';
        return;
      }
      if (e.key.length === 1) rfidBuffer.current += e.key;
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [duke_lexuar_rfid]);

  async function ngarko() {
    try { const { data } = await api.get('/users'); setPerdoruesit(data); } catch { }
  }

  function hapModal(u = null) {
    setEditUser(u);
    setForma(u
      ? { emri: u.emri, username: u.username, password: '', pin: u.pin || '', rfidKod: u.rfidKod || '', role: u.role }
      : { emri: '', username: '', password: '', pin: '', rfidKod: '', role: 'KAMERIER' });
    setGabim('');
    setModal(true);
  }

  async function ruaj(e) {
    e.preventDefault();
    setGabim('');
    if (forma.pin && forma.pin.length !== 4) { setGabim('PIN duhet të jetë saktësisht 4 shifra.'); return; }
    setDukeRuajtur(true);
    try {
      const payload = {
        emri: forma.emri, role: forma.role, pin: forma.pin,
        rfidKod: forma.rfidKod || null,
        ...(forma.password ? { password: forma.password } : {})
      };
      if (editUser) await api.put(`/users/${editUser.id}`, payload);
      else await api.post('/users', { ...payload, username: forma.username });
      setModal(false); ngarko();
    } catch (err) { setGabim(err.response?.data?.gabim || 'Gabim.'); }
    finally { setDukeRuajtur(false); }
  }

  async function ndryshoStatus(id, aktiv) {
    await api.put(`/users/${id}`, { aktiv: !aktiv }); ngarko();
  }

  const roletNgjyra = { ADMIN: '#2563eb', KAMERIER: '#5a9e0f', ARKATAR: '#ea580c', MENAXHER: '#7c3aed' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--tx)' }}>Punonjesit & Autentikimi</div>
        <button onClick={() => hapModal()} className="btn-primary">+ Punonjes i Ri</button>
      </div>

      {/* INFO RFID */}
      <div style={{ background: 'rgba(90,158,15,0.06)', border: '1.5px solid rgba(90,158,15,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: 'var(--tx)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 20 }}>📡</span>
        <div>
          <strong>Sistemi mbështet dy mënyra kyçjeje:</strong> PIN 4-shifror (me tastierë) dhe Kartë RFID/NFC (me lexues USB).
          Çdo punonjës mund të ketë të dyja ose vetëm njërën.
        </div>
      </div>

      <div className="tabela">
        <table>
          <thead><tr><th>Emri</th><th>Roli</th><th>PIN</th><th>Kartë RFID</th><th>Statusi</th><th></th></tr></thead>
          <tbody>
            {perdoruesit.map(u => (
              <tr key={u.id}>
                <td style={{ fontWeight: 600 }}>{u.emri}</td>
                <td>
                  <span style={{ background: `${roletNgjyra[u.role]}18`, color: roletNgjyra[u.role], padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{u.role}</span>
                </td>
                <td>
                  {u.pin ? <span style={{ fontFamily: 'monospace', letterSpacing: 3, color: 'var(--lm)', fontWeight: 700 }}>••••</span>
                    : <span style={{ color: 'var(--mt)', fontSize: 11 }}>— pa PIN</span>}
                </td>
                <td>
                  {u.rfidKod
                    ? <span style={{ color: 'var(--lm)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}><span>📡</span> E regjistruar</span>
                    : <span style={{ color: 'var(--mt)', fontSize: 11 }}>— pa kartë</span>}
                </td>
                <td>
                  <span className={u.aktiv ? 'badge-green' : 'badge-red'}>{u.aktiv ? 'Aktiv' : 'Jo Aktiv'}</span>
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
          <div className="modal-box" style={{ maxWidth: 420 }}>
            <div className="modal-title">{editUser ? 'Edito Punonjesin' : 'Punonjes i Ri'}</div>
            {gabim && <div style={{ color: 'var(--rd)', fontSize: 12, marginBottom: 10, background: 'rgba(220,38,38,0.08)', padding: '8px 12px', borderRadius: 8 }}>{gabim}</div>}

            <form onSubmit={ruaj}>
              <div className="form-group"><label className="form-label">Emri i Plote *</label>
                <input required value={forma.emri} onChange={e => setForma({ ...forma, emri: e.target.value })} placeholder="p.sh. Agim Krasniqi" />
              </div>

              {!editUser && (
                <div className="form-group"><label className="form-label">Username *</label>
                  <input required value={forma.username} onChange={e => setForma({ ...forma, username: e.target.value })} placeholder="p.sh. agim_k" />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="form-group"><label className="form-label">Roli</label>
                  <select value={forma.role} onChange={e => setForma({ ...forma, role: e.target.value })}>
                    {['KAMERIER', 'ARKATAR', 'MENAXHER', 'ADMIN'].map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{editUser ? 'Fjalekalimi i Ri' : 'Fjalekalimi *'}</label>
                  <input type="password" required={!editUser} value={forma.password}
                    onChange={e => setForma({ ...forma, password: e.target.value })} placeholder={editUser ? '(lere bosh)' : '••••••'} />
                </div>
              </div>

              {/* SEKSIONI PIN + RFID */}
              <div style={{ background: 'var(--bg3)', border: '1.5px solid var(--bd)', borderRadius: 10, padding: 14, marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--tx)', marginBottom: 12 }}>Metodat e Kyçjes</div>

                {/* PIN */}
                <div className="form-group">
                  <label className="form-label">🔢 PIN (4 shifra)</label>
                  <input type="text" maxLength={4} value={forma.pin}
                    onChange={e => setForma({ ...forma, pin: e.target.value.replace(/\D/g, '') })}
                    placeholder="p.sh. 1234"
                    style={{ letterSpacing: 8, textAlign: 'center', fontSize: 18, fontWeight: 700, color: 'var(--lm)' }} />
                </div>

                {/* RFID */}
                <div className="form-group">
                  <label className="form-label">📡 Karta RFID/NFC</label>
                  {duke_lexuar_rfid ? (
                    <div style={{ background: 'rgba(90,158,15,0.08)', border: '2px solid var(--lm)', borderRadius: 8, padding: '14px', textAlign: 'center' }}>
                      <div style={{ fontSize: 28, marginBottom: 6 }}>📡</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--lm)', marginBottom: 4 }}>Vendosni kartën tani...</div>
                      <div style={{ fontSize: 11, color: 'var(--mt)' }}>Afrojeni kartën te lexuesi RFID</div>
                      <button type="button" onClick={() => setDukeLexuarRfid(false)}
                        style={{ marginTop: 10, padding: '5px 14px', background: 'var(--bg3)', border: '1px solid var(--bd)', borderRadius: 6, fontSize: 11, color: 'var(--mt)', cursor: 'pointer' }}>
                        Anulo
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input value={forma.rfidKod} readOnly
                        placeholder="(jo e regjistruar)"
                        style={{ color: forma.rfidKod ? 'var(--lm)' : 'var(--mt)', fontFamily: 'monospace', fontSize: 12 }} />
                      <button type="button" onClick={() => { setDukeLexuarRfid(true); rfidBuffer.current = ''; }}
                        style={{ flexShrink: 0, padding: '8px 14px', background: 'var(--lm)', color: 'var(--ld)', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        📡 Lexo Kartën
                      </button>
                    </div>
                  )}
                  {forma.rfidKod && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11 }}>
                      <span style={{ color: 'var(--lm)' }}>✓ Karta u lexua me sukses</span>
                      <button type="button" onClick={() => setForma(f => ({ ...f, rfidKod: '' }))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rd)', fontSize: 11 }}>Hiqe</button>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setModal(false)} className="btn-secondary" style={{ flex: 1 }}>Anulo</button>
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
