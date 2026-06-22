import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Users() {
  const [perdoruesit, setPerdoruesit] = useState([]);
  const [modalHapur, setModalHapur] = useState(false);
  const [perdoruesiEdit, setPerdoruesiEdit] = useState(null);
  const [forma, setForma] = useState({ emri: '', username: '', password: '', pin: '', role: 'KAMERIER' });
  const [gabim, setGabim] = useState('');
  const [duke_ruajtur, setDukeRuajtur] = useState(false);

  useEffect(() => { ngarko(); }, []);

  async function ngarko() {
    try {
      const { data } = await api.get('/users');
      setPerdoruesit(data);
    } catch { }
  }

  function hapModal(u = null) {
    setPerdoruesiEdit(u);
    setForma(u ? { emri: u.emri, username: u.username, password: '', pin: u.pin || '', role: u.role } : { emri: '', username: '', password: '', pin: '', role: 'KAMERIER' });
    setGabim('');
    setModalHapur(true);
  }

  async function ruaj(e) {
    e.preventDefault();
    setGabim('');
    if (forma.pin && forma.pin.length !== 4) { setGabim('PIN duhet te jete saktesisht 4 shifra.'); return; }
    setDukeRuajtur(true);
    try {
      if (perdoruesiEdit) {
        await api.put(`/users/${perdoruesiEdit.id}`, { emri: forma.emri, role: forma.role, pin: forma.pin, ...(forma.password ? { password: forma.password } : {}) });
      } else {
        if (!forma.password) { setGabim('Fjalekalimi eshte i detyrueshem.'); setDukeRuajtur(false); return; }
        await api.post('/users', forma);
      }
      setModalHapur(false);
      ngarko();
    } catch (err) {
      setGabim(err.response?.data?.gabim || 'Gabim gjate ruajtjes.');
    } finally {
      setDukeRuajtur(false);
    }
  }

  async function ndryshoStatusin(id, aktiv) {
    await api.put(`/users/${id}`, { aktiv: !aktiv });
    ngarko();
  }

  const roletNgjyra = { ADMIN: '#60a5fa', KAMERIER: 'var(--lm)', ARKATAR: 'var(--or)', MENAXHER: '#a78bfa' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--tx)' }}>Punonjesit & PIN-et</div>
        <button onClick={() => hapModal()} style={{ padding: '7px 14px', background: 'var(--lm)', color: 'var(--ld)', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
          + Punonjes i Ri
        </button>
      </div>

      <div style={{ background: 'var(--bg3)', border: '1px solid var(--bd)', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg2)' }}>
              {['Emri', 'Roli', 'PIN', 'Statusi', 'Veprime'].map(h => (
                <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--mt)', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {perdoruesit.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--bd)' }}>
                <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--tx)' }}>{u.emri}</td>
                <td style={{ padding: '8px 12px' }}>
                  <span style={{ background: `${roletNgjyra[u.role]}20`, color: roletNgjyra[u.role], padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>{u.role}</span>
                </td>
                <td style={{ padding: '8px 12px', fontFamily: 'monospace', letterSpacing: 3, color: 'var(--lm)' }}>
                  {u.pin ? '••••' : <span style={{ color: 'var(--rd)', fontSize: 10 }}>S'ka PIN</span>}
                </td>
                <td style={{ padding: '8px 12px' }}>
                  <span style={{ background: u.aktiv ? 'rgba(166,230,53,0.12)' : 'rgba(248,113,113,0.12)', color: u.aktiv ? 'var(--lm)' : 'var(--rd)', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>
                    {u.aktiv ? 'Aktiv' : 'Jo Aktiv'}
                  </span>
                </td>
                <td style={{ padding: '8px 12px' }}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <span onClick={() => hapModal(u)} style={{ color: 'var(--mt)', cursor: 'pointer', fontSize: 14 }}>✏️</span>
                    <span onClick={() => ndryshoStatusin(u.id, u.aktiv)} style={{ color: 'var(--mt)', cursor: 'pointer', fontSize: 14 }}>
                      {u.aktiv ? '🚫' : '✅'}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalHapur && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--bd)', borderRadius: 14, padding: 20, width: '100%', maxWidth: 340 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--tx)', marginBottom: 14 }}>
              {perdoruesiEdit ? 'Edito Punonjesin' : 'Punonjes i Ri'}
            </div>
            {gabim && <div style={{ color: 'var(--rd)', fontSize: 11, marginBottom: 10 }}>{gabim}</div>}
            <form onSubmit={ruaj}>
              {[['Emri i Plote', 'emri', 'text', true], ['Username', 'username', 'text', !perdoruesiEdit], ['Fjalekalimi', 'password', 'password', !perdoruesiEdit]].map(([lbl, field, type, req]) => (
                <div key={field}>
                  <div style={{ fontSize: 10, color: 'var(--mt)', marginBottom: 4, fontWeight: 500 }}>{lbl}{req ? ' *' : ''}</div>
                  <input type={type} required={req} value={forma[field]} onChange={e => setForma({ ...forma, [field]: e.target.value })}
                    disabled={field === 'username' && !!perdoruesiEdit}
                    style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 7, padding: '7px 10px', color: 'var(--tx)', fontSize: 12, outline: 'none', marginBottom: 10, opacity: field === 'username' && perdoruesiEdit ? 0.5 : 1 }} />
                </div>
              ))}
              <div>
                <div style={{ fontSize: 10, color: 'var(--mt)', marginBottom: 4, fontWeight: 500 }}>PIN (4 shifra) *</div>
                <input type="text" maxLength={4} required value={forma.pin} onChange={e => setForma({ ...forma, pin: e.target.value.replace(/\D/g, '') })}
                  placeholder="p.sh. 1234"
                  style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 7, padding: '7px 10px', color: 'var(--lm)', fontSize: 18, fontWeight: 700, letterSpacing: 8, outline: 'none', marginBottom: 10, textAlign: 'center' }} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--mt)', marginBottom: 4, fontWeight: 500 }}>Roli</div>
                <select value={forma.role} onChange={e => setForma({ ...forma, role: e.target.value })}
                  style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 7, padding: '7px 10px', color: 'var(--tx)', fontSize: 12, outline: 'none', marginBottom: 14 }}>
                  {['KAMERIER', 'ARKATAR', 'MENAXHER', 'ADMIN'].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={() => setModalHapur(false)} style={{ flex: 1, padding: 9, background: 'var(--bg3)', border: '1px solid var(--bd)', borderRadius: 8, fontSize: 12, color: 'var(--mt)', cursor: 'pointer' }}>Anulo</button>
                <button type="submit" disabled={duke_ruajtur} style={{ flex: 2, padding: 9, background: 'var(--lm)', color: 'var(--ld)', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  {duke_ruajtur ? 'Duke ruajtur...' : 'Ruaj'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
