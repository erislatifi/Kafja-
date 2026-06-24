import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Stock() {
  const [produktet, setProduktet] = useState([]);
  const [alarmet, setAlarmet] = useState([]);
  const [tab, setTab] = useState('te_gjitha');
  const [modalShto, setModalShto] = useState(false);
  const [modalEdito, setModalEdito] = useState(null);
  const [forma, setForma] = useState({ productId: '', sasia: '', shenim: '' });
  const [editForma, setEditForma] = useState({ sasiaStok: '', alarmStokuMin: '' });
  const [gabim, setGabim] = useState('');
  const [duke_ruajtur, setDukeRuajtur] = useState(false);

  useEffect(() => { ngarko(); }, []);

  async function ngarko() {
    try {
      const [r1, r2] = await Promise.all([api.get('/products?aktiv=true'), api.get('/stock/alarm')]);
      setProduktet(r1.data);
      setAlarmet(r2.data);
      if (r1.data.length > 0) setForma(f => ({ ...f, productId: f.productId || r1.data[0].id }));
    } catch { }
  }

  async function shtoStok(e) {
    e.preventDefault();
    if (!forma.sasia || Number(forma.sasia) <= 0) { setGabim('Sasia duhet te jete me e madhe se 0.'); return; }
    setDukeRuajtur(true); setGabim('');
    try {
      await api.post('/stock/shto', forma);
      setModalShto(false);
      setForma(f => ({ ...f, sasia: '', shenim: '' }));
      ngarko();
    } catch (err) { setGabim(err.response?.data?.gabim || 'Gabim.'); }
    finally { setDukeRuajtur(false); }
  }

  async function ruajEditim(e) {
    e.preventDefault();
    setDukeRuajtur(true);
    try {
      await api.put(`/products/${modalEdito.id}`, {
        sasiaStok: Number(editForma.sasiaStok),
        alarmStokuMin: Number(editForma.alarmStokuMin)
      });
      setModalEdito(null);
      ngarko();
    } catch (err) { setGabim(err.response?.data?.gabim || 'Gabim.'); }
    finally { setDukeRuajtur(false); }
  }

  const lista = tab === 'alarm' ? alarmet : produktet;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--tx)' }}>Stoku</div>
        <button onClick={() => setModalShto(true)} className="btn-primary">📦 Shto Stok</button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button onClick={() => setTab('te_gjitha')} style={{ padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: tab === 'te_gjitha' ? 'var(--lm)' : 'var(--bg3)', color: tab === 'te_gjitha' ? 'var(--ld)' : 'var(--tx)', border: `1.5px solid ${tab === 'te_gjitha' ? 'var(--lm)' : 'var(--bd)'}` }}>
          Të Gjitha ({produktet.length})
        </button>
        <button onClick={() => setTab('alarm')} style={{ padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: tab === 'alarm' ? 'var(--or)' : 'var(--bg3)', color: tab === 'alarm' ? '#fff' : 'var(--tx)', border: `1.5px solid ${tab === 'alarm' ? 'var(--or)' : 'var(--bd)'}` }}>
          ⚠️ Alarm ({alarmet.length})
        </button>
      </div>

      <div className="tabela">
        <table>
          <thead>
            <tr><th>Produkti</th><th>Kategoria</th><th>Stoku</th><th>Alarm Min.</th><th>Statusi</th><th>Veprime</th></tr>
          </thead>
          <tbody>
            {lista.map(p => {
              const ulet = Number(p.sasiaStok) <= Number(p.alarmStokuMin);
              return (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.emri}</td>
                  <td style={{ color: 'var(--mt)' }}>{p.category?.emri}</td>
                  <td style={{ fontWeight: 700, color: ulet ? 'var(--or)' : 'var(--tx)' }}>
                    {Number(p.sasiaStok)} {p.njesia?.toLowerCase()}
                  </td>
                  <td style={{ color: 'var(--mt)' }}>{Number(p.alarmStokuMin)}</td>
                  <td><span className={ulet ? 'badge-orange' : 'badge-green'}>{ulet ? 'Alarm' : 'OK'}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => { setModalEdito(p); setEditForma({ sasiaStok: String(Number(p.sasiaStok)), alarmStokuMin: String(Number(p.alarmStokuMin)) }); setGabim(''); }}
                        style={{ background: 'var(--bg3)', border: '1px solid var(--bd)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 13 }} title="Edito stokun">✏️</button>
                      <button onClick={() => { setForma(f => ({ ...f, productId: p.id })); setModalShto(true); }}
                        style={{ background: 'rgba(90,158,15,0.08)', border: '1px solid rgba(90,158,15,0.3)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 13 }} title="Shto stok">+</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {lista.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 30, color: 'var(--mt)' }}>Nuk ka produkte.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* MODAL SHTO STOK */}
      {modalShto && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-title">📦 Shto Stok</div>
            {gabim && <div style={{ color: 'var(--rd)', fontSize: 12, marginBottom: 10, background: 'rgba(220,38,38,0.08)', padding: '8px 12px', borderRadius: 8 }}>{gabim}</div>}
            <form onSubmit={shtoStok}>
              <div className="form-group"><label className="form-label">Produkti *</label>
                <select value={forma.productId} onChange={e => setForma({ ...forma, productId: e.target.value })}>
                  {produktet.map(p => <option key={p.id} value={p.id}>{p.emri} — Stoku: {Number(p.sasiaStok)}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Sasia *</label>
                <input type="number" step="0.01" min="0.01" required value={forma.sasia} onChange={e => setForma({ ...forma, sasia: e.target.value })} placeholder="p.sh. 50" />
              </div>
              <div className="form-group"><label className="form-label">Shënim (opsional)</label>
                <input value={forma.shenim} onChange={e => setForma({ ...forma, shenim: e.target.value })} placeholder="p.sh. Blerje nga furnizuesi" />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button type="button" onClick={() => setModalShto(false)} className="btn-secondary" style={{ flex: 1 }}>Anulo</button>
                <button type="submit" disabled={duke_ruajtur} className="btn-primary" style={{ flex: 2 }}>{duke_ruajtur ? 'Duke shtuar...' : '✓ Shto'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITO STOK */}
      {modalEdito && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 340 }}>
            <div className="modal-title">✏️ Edito Stokun — {modalEdito.emri}</div>
            {gabim && <div style={{ color: 'var(--rd)', fontSize: 12, marginBottom: 10, background: 'rgba(220,38,38,0.08)', padding: '8px 12px', borderRadius: 8 }}>{gabim}</div>}
            <form onSubmit={ruajEditim}>
              <div className="form-group"><label className="form-label">Sasia Aktuale (ndrysho direkt)</label>
                <input type="number" step="0.01" min="0" required value={editForma.sasiaStok} onChange={e => setEditForma({ ...editForma, sasiaStok: e.target.value })} />
              </div>
              <div className="form-group"><label className="form-label">Alarmi Minimum</label>
                <input type="number" step="1" min="0" value={editForma.alarmStokuMin} onChange={e => setEditForma({ ...editForma, alarmStokuMin: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button type="button" onClick={() => setModalEdito(null)} className="btn-secondary" style={{ flex: 1 }}>Anulo</button>
                <button type="submit" disabled={duke_ruajtur} className="btn-primary" style={{ flex: 2 }}>{duke_ruajtur ? 'Duke ruajtur...' : '✓ Ruaj'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
