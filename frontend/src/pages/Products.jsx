import { useState, useEffect } from 'react';
import api from '../services/api';

const njesitet = [{ v: 'COPE', l: 'Cope' }, { v: 'KG', l: 'Kg' }, { v: 'LITER', l: 'Liter' }, { v: 'GRAM', l: 'Gram' }, { v: 'ML', l: 'Ml' }];

export default function Products() {
  const [produktet, setProduktet] = useState([]);
  const [kategorite, setKategorite] = useState([]);
  const [kerkimi, setKerkimi] = useState('');
  const [modal, setModal] = useState(false);
  const [produktiEdit, setProduktiEdit] = useState(null);
  const [forma, setForma] = useState({ emri: '', categoryId: '', cmimiShitjes: '', cmimiBlerjes: '', sasiaStok: 0, njesia: 'COPE', alarmStokuMin: 5, barkod: '' });
  const [gabim, setGabim] = useState('');
  const [duke_ruajtur, setDukeRuajtur] = useState(false);

  useEffect(() => { ngarko(); }, []);

  async function ngarko() {
    const [r1, r2] = await Promise.all([api.get('/products'), api.get('/products/categories/all')]);
    setProduktet(r1.data);
    setKategorite(r2.data);
    if (r2.data.length > 0) setForma(f => ({ ...f, categoryId: f.categoryId || r2.data[0].id }));
  }

  function hapModal(p = null) {
    setProduktiEdit(p);
    setForma(p ? { emri: p.emri, categoryId: p.categoryId, cmimiShitjes: p.cmimiShitjes, cmimiBlerjes: p.cmimiBlerjes || '', sasiaStok: p.sasiaStok, njesia: p.njesia, alarmStokuMin: p.alarmStokuMin, barkod: p.barkod || '' }
      : { emri: '', categoryId: kategorite[0]?.id || '', cmimiShitjes: '', cmimiBlerjes: '', sasiaStok: 0, njesia: 'COPE', alarmStokuMin: 5, barkod: '' });
    setGabim(''); setModal(true);
  }

  async function ruaj(e) {
    e.preventDefault(); setGabim(''); setDukeRuajtur(true);
    try {
      if (produktiEdit) await api.put(`/products/${produktiEdit.id}`, forma);
      else await api.post('/products', forma);
      setModal(false); ngarko();
    } catch (err) { setGabim(err.response?.data?.gabim || 'Gabim.'); }
    finally { setDukeRuajtur(false); }
  }

  const lista = produktet.filter(p => p.emri.toLowerCase().includes(kerkimi.toLowerCase()));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--tx)' }}>Produktet & Pijet</div>
        <button onClick={() => hapModal()} className="btn-primary">+ Produkt i Ri</button>
      </div>

      <input type="text" value={kerkimi} onChange={e => setKerkimi(e.target.value)}
        placeholder="Kerko produkt..." style={{ maxWidth: 260, marginBottom: 14 }} />

      <div className="tabela">
        <table>
          <thead><tr><th>Emri</th><th>Kategoria</th><th>Çmimi</th><th>Stoku</th><th>Statusi</th><th>Veprime</th></tr></thead>
          <tbody>
            {lista.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 600 }}>{p.emri}</td>
                <td style={{ color: 'var(--mt)' }}>{p.category?.emri}</td>
                <td style={{ color: 'var(--lm)', fontWeight: 700 }}>{Number(p.cmimiShitjes).toFixed(2)} €</td>
                <td style={{ color: Number(p.sasiaStok) <= Number(p.alarmStokuMin) ? 'var(--or)' : 'var(--tx)', fontWeight: 600 }}>
                  {Number(p.sasiaStok)} {p.njesia}
                </td>
                <td><span className={p.aktiv ? 'badge-green' : 'badge-red'}>{p.aktiv ? 'Aktiv' : 'Jo Aktiv'}</span></td>
                <td>
                  <button onClick={() => hapModal(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--mt)' }}>✏️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 440 }}>
            <div className="modal-title">{produktiEdit ? 'Edito Produktin' : 'Produkt i Ri'}</div>
            {gabim && <div style={{ color: 'var(--rd)', fontSize: 12, marginBottom: 10, background: 'rgba(220,38,38,0.08)', padding: '8px 12px', borderRadius: 8 }}>{gabim}</div>}
            <form onSubmit={ruaj}>
              <div className="form-group"><label className="form-label">Emri *</label><input required value={forma.emri} onChange={e => setForma({ ...forma, emri: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Kategoria *</label>
                <select value={forma.categoryId} onChange={e => setForma({ ...forma, categoryId: e.target.value })}>
                  {kategorite.map(k => <option key={k.id} value={k.id}>{k.ikona} {k.emri}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="form-group"><label className="form-label">Çmimi Shitjes (€) *</label><input required type="number" step="0.01" min="0" value={forma.cmimiShitjes} onChange={e => setForma({ ...forma, cmimiShitjes: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Çmimi Blerjes (€)</label><input type="number" step="0.01" min="0" value={forma.cmimiBlerjes} onChange={e => setForma({ ...forma, cmimiBlerjes: e.target.value })} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                {!produktiEdit && <div className="form-group"><label className="form-label">Stoku Fillestar</label><input type="number" step="0.01" min="0" value={forma.sasiaStok} onChange={e => setForma({ ...forma, sasiaStok: e.target.value })} /></div>}
                <div className="form-group"><label className="form-label">Njesia</label>
                  <select value={forma.njesia} onChange={e => setForma({ ...forma, njesia: e.target.value })}>
                    {njesitet.map(n => <option key={n.v} value={n.v}>{n.l}</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Alarm Min.</label><input type="number" step="0.01" min="0" value={forma.alarmStokuMin} onChange={e => setForma({ ...forma, alarmStokuMin: e.target.value })} /></div>
              </div>
              <div className="form-group"><label className="form-label">Barkodi (opsional)</label><input value={forma.barkod} onChange={e => setForma({ ...forma, barkod: e.target.value })} /></div>
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
    </div>
  );
}
