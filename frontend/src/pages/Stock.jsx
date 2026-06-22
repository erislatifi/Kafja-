import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Stock() {
  const [produktet, setProduktet] = useState([]);
  const [alarmet, setAlarmet] = useState([]);
  const [tab, setTab] = useState('te_gjitha');
  const [modal, setModal] = useState(false);
  const [forma, setForma] = useState({ productId: '', sasia: '', shenim: '' });
  const [gabim, setGabim] = useState('');
  const [duke_ruajtur, setDukeRuajtur] = useState(false);

  useEffect(() => { ngarko(); }, []);

  async function ngarko() {
    try {
      const [r1, r2] = await Promise.all([api.get('/products?aktiv=true'), api.get('/stock/alarm')]);
      setProduktet(r1.data);
      setAlarmet(r2.data);
      if (r1.data.length > 0 && !forma.productId) {
        setForma(f => ({ ...f, productId: r1.data[0].id }));
      }
    } catch { }
  }

  async function shtoStok(e) {
    e.preventDefault();
    if (!forma.sasia || Number(forma.sasia) <= 0) { setGabim('Sasia duhet te jete me e madhe se 0.'); return; }
    setDukeRuajtur(true); setGabim('');
    try {
      await api.post('/stock/shto', forma);
      setModal(false);
      setForma(f => ({ ...f, sasia: '', shenim: '' }));
      ngarko();
    } catch (err) {
      setGabim(err.response?.data?.gabim || 'Gabim gjate shtimit.');
    } finally { setDukeRuajtur(false); }
  }

  const lista = tab === 'alarm' ? alarmet : produktet;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--tx)' }}>Stoku</div>
        <button onClick={() => setModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          📦 Shto Stok
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button onClick={() => setTab('te_gjitha')} style={{ padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: tab === 'te_gjitha' ? 'var(--lm)' : 'var(--bg3)', color: tab === 'te_gjitha' ? 'var(--ld)' : 'var(--tx)', border: `1.5px solid ${tab === 'te_gjitha' ? 'var(--lm)' : 'var(--bd)'}` }}>
          Te Gjitha ({produktet.length})
        </button>
        <button onClick={() => setTab('alarm')} style={{ padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: tab === 'alarm' ? 'var(--or)' : 'var(--bg3)', color: tab === 'alarm' ? '#fff' : 'var(--tx)', border: `1.5px solid ${tab === 'alarm' ? 'var(--or)' : 'var(--bd)'}`, display: 'flex', alignItems: 'center', gap: 5 }}>
          ⚠️ Stok i Ulet ({alarmet.length})
        </button>
      </div>

      <div className="tabela">
        <table>
          <thead>
            <tr>
              <th>Produkti</th><th>Kategoria</th><th>Stoku Aktual</th><th>Alarm Min.</th><th>Statusi</th>
            </tr>
          </thead>
          <tbody>
            {lista.map(p => {
              const ulet = Number(p.sasiaStok) <= Number(p.alarmStokuMin);
              return (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.emri}</td>
                  <td style={{ color: 'var(--mt)' }}>{p.category?.emri}</td>
                  <td style={{ fontWeight: 700, color: ulet ? 'var(--or)' : 'var(--tx)' }}>
                    {Number(p.sasiaStok)} {p.njesia === 'COPE' ? 'cope' : p.njesia?.toLowerCase()}
                  </td>
                  <td style={{ color: 'var(--mt)' }}>{Number(p.alarmStokuMin)}</td>
                  <td>
                    <span className={ulet ? 'badge-orange' : 'badge-green'}>{ulet ? 'Stok Ulet' : 'Ne Rregull'}</span>
                  </td>
                </tr>
              );
            })}
            {lista.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--mt)', padding: 30 }}>Nuk ka produkte.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL SHTO STOK */}
      {modal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-title">📦 Shto Stok</div>
            {gabim && <div style={{ color: 'var(--rd)', fontSize: 12, marginBottom: 10, background: 'rgba(220,38,38,0.08)', padding: '8px 12px', borderRadius: 8 }}>{gabim}</div>}
            <form onSubmit={shtoStok}>
              <div className="form-group">
                <label className="form-label">Produkti *</label>
                <select value={forma.productId} onChange={e => setForma({ ...forma, productId: e.target.value })}>
                  {produktet.map(p => (
                    <option key={p.id} value={p.id}>{p.emri} — Stoku: {Number(p.sasiaStok)} {p.njesia}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Sasia per ta Shtuar *</label>
                <input type="number" step="0.01" min="0.01" required value={forma.sasia}
                  onChange={e => setForma({ ...forma, sasia: e.target.value })} placeholder="p.sh. 50" />
              </div>
              <div className="form-group">
                <label className="form-label">Shenim (opsional)</label>
                <input type="text" value={forma.shenim}
                  onChange={e => setForma({ ...forma, shenim: e.target.value })} placeholder="p.sh. Blerje nga furnizuesi X" />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button type="button" onClick={() => setModal(false)} className="btn-secondary" style={{ flex: 1 }}>Anulo</button>
                <button type="submit" disabled={duke_ruajtur} className="btn-primary" style={{ flex: 2 }}>
                  {duke_ruajtur ? 'Duke shtuar...' : '✓ Shto Stok'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
