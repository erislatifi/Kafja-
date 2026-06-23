import { useState, useEffect } from 'react';
import api from '../services/api';

const njesitet = [{ v: 'COPE', l: 'Cope' }, { v: 'KG', l: 'Kg' }, { v: 'LITER', l: 'Liter' }, { v: 'GRAM', l: 'Gram' }, { v: 'ML', l: 'Ml' }];

export default function Products() {
  const [produktet, setProduktet] = useState([]);
  const [kategorite, setKategorite] = useState([]);
  const [kerkimi, setKerkimi] = useState('');
  const [modal, setModal] = useState(false);
  const [konfirmFshij, setKonfirmFshij] = useState(null);
  const [produktiEdit, setProduktiEdit] = useState(null);
  const [forma, setForma] = useState({ emri: '', categoryId: '', cmimiShitjes: '', cmimiBlerjes: '', sasiaStok: 0, njesia: 'COPE', alarmStokuMin: 5, barkod: '', aktiv: true });
  const [gabim, setGabim] = useState('');
  const [duke_ruajtur, setDukeRuajtur] = useState(false);
  const [duke_fshij, setDukeFshij] = useState(false);

  useEffect(() => { ngarko(); }, []);

  async function ngarko() {
    try {
      const [r1, r2] = await Promise.all([api.get('/products'), api.get('/products/categories/all')]);
      setProduktet(r1.data);
      setKategorite(r2.data);
    } catch { }
  }

  function hapModal(p = null) {
    setProduktiEdit(p);
    setForma(p
      ? { emri: p.emri, categoryId: p.categoryId, cmimiShitjes: p.cmimiShitjes, cmimiBlerjes: p.cmimiBlerjes || '', sasiaStok: p.sasiaStok, njesia: p.njesia, alarmStokuMin: p.alarmStokuMin, barkod: p.barkod || '', aktiv: p.aktiv }
      : { emri: '', categoryId: kategorite[0]?.id || '', cmimiShitjes: '', cmimiBlerjes: '', sasiaStok: 0, njesia: 'COPE', alarmStokuMin: 5, barkod: '', aktiv: true });
    setGabim('');
    setModal(true);
  }

  async function ruaj(e) {
    e.preventDefault();
    setGabim('');
    setDukeRuajtur(true);
    try {
      if (produktiEdit) await api.put(`/products/${produktiEdit.id}`, forma);
      else await api.post('/products', forma);
      setModal(false);
      ngarko();
    } catch (err) { setGabim(err.response?.data?.gabim || 'Gabim.'); }
    finally { setDukeRuajtur(false); }
  }

  async function fshij(id) {
    setDukeFshij(true);
    try {
      await api.delete(`/products/${id}`);
      setKonfirmFshij(null);
      ngarko();
    } catch (err) {
      alert(err.response?.data?.gabim || 'Nuk mund të fshihet — ka porosi të lidhura. Çaktivizoje.');
      setKonfirmFshij(null);
    } finally { setDukeFshij(false); }
  }

  async function ndryshoStatus(p) {
    await api.put(`/products/${p.id}`, { aktiv: !p.aktiv });
    ngarko();
  }

  const lista = produktet.filter(p => p.emri.toLowerCase().includes(kerkimi.toLowerCase()));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--tx)' }}>Produktet & Pijet</div>
        <button onClick={() => hapModal()} className="btn-primary">+ Produkt i Ri</button>
      </div>

      <input type="text" value={kerkimi} onChange={e => setKerkimi(e.target.value)}
        placeholder="Kërko produkt..." style={{ maxWidth: 260, marginBottom: 14 }} />

      <div className="tabela">
        <table>
          <thead>
            <tr><th>Emri</th><th>Kategoria</th><th>Çmimi</th><th>Stoku</th><th>Statusi</th><th>Veprime</th></tr>
          </thead>
          <tbody>
            {lista.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 30, color: 'var(--mt)' }}>Nuk ka produkte.</td></tr>
            ) : lista.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 600 }}>{p.emri}</td>
                <td style={{ color: 'var(--mt)' }}>{p.category?.emri}</td>
                <td style={{ color: 'var(--lm)', fontWeight: 700 }}>{Number(p.cmimiShitjes).toFixed(2)} €</td>
                <td style={{ color: Number(p.sasiaStok) <= Number(p.alarmStokuMin) ? 'var(--or)' : 'var(--tx)', fontWeight: 600 }}>
                  {Number(p.sasiaStok)} {p.njesia}
                </td>
                <td><span className={p.aktiv ? 'badge-green' : 'badge-red'}>{p.aktiv ? 'Aktiv' : 'Jo Aktiv'}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => hapModal(p)} style={{ background: 'var(--bg3)', border: '1px solid var(--bd)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 13 }} title="Edito">✏️</button>
                    <button onClick={() => ndryshoStatus(p)} style={{ background: p.aktiv ? 'rgba(234,88,12,0.08)' : 'rgba(90,158,15,0.08)', border: `1px solid ${p.aktiv ? 'rgba(234,88,12,0.3)' : 'rgba(90,158,15,0.3)'}`, borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 13 }} title={p.aktiv ? 'Çaktivizo' : 'Aktivo'}>
                      {p.aktiv ? '🚫' : '✅'}
                    </button>
                    <button onClick={() => setKonfirmFshij(p)} style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 13 }} title="Fshij">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL SHTO/EDITO */}
      {modal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 440 }}>
            <div className="modal-title">{produktiEdit ? `Edito: ${produktiEdit.emri}` : 'Produkt i Ri'}</div>
            {gabim && <div style={{ color: 'var(--rd)', fontSize: 12, marginBottom: 10, background: 'rgba(220,38,38,0.08)', padding: '8px 12px', borderRadius: 8 }}>{gabim}</div>}
            <form onSubmit={ruaj}>
              <div className="form-group"><label className="form-label">Emri *</label>
                <input required value={forma.emri} onChange={e => setForma({ ...forma, emri: e.target.value })} />
              </div>
              <div className="form-group"><label className="form-label">Kategoria *</label>
                <select value={forma.categoryId} onChange={e => setForma({ ...forma, categoryId: e.target.value })}>
                  {kategorite.map(k => <option key={k.id} value={k.id}>{k.ikona} {k.emri}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="form-group"><label className="form-label">Çmimi Shitjes (€) *</label>
                  <input required type="number" step="0.01" min="0" value={forma.cmimiShitjes} onChange={e => setForma({ ...forma, cmimiShitjes: e.target.value })} />
                </div>
                <div className="form-group"><label className="form-label">Çmimi Blerjes (€)</label>
                  <input type="number" step="0.01" min="0" value={forma.cmimiBlerjes} onChange={e => setForma({ ...forma, cmimiBlerjes: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                {!produktiEdit && (
                  <div className="form-group"><label className="form-label">Stoku Fillestar</label>
                    <input type="number" step="0.01" min="0" value={forma.sasiaStok} onChange={e => setForma({ ...forma, sasiaStok: e.target.value })} />
                  </div>
                )}
                <div className="form-group"><label className="form-label">Njësia</label>
                  <select value={forma.njesia} onChange={e => setForma({ ...forma, njesia: e.target.value })}>
                    {njesitet.map(n => <option key={n.v} value={n.v}>{n.l}</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Alarm Min.</label>
                  <input type="number" step="1" min="0" value={forma.alarmStokuMin} onChange={e => setForma({ ...forma, alarmStokuMin: e.target.value })} />
                </div>
              </div>
              <div className="form-group"><label className="form-label">Barkodi (opsional)</label>
                <input value={forma.barkod} onChange={e => setForma({ ...forma, barkod: e.target.value })} />
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
            <div className="modal-title">Fshij Produktin?</div>
            <div style={{ fontSize: 13, color: 'var(--mt)', marginBottom: 8 }}>
              A jeni të sigurt që doni ta fshini <strong style={{ color: 'var(--tx)' }}>{konfirmFshij.emri}</strong>?
            </div>
            <div style={{ fontSize: 12, color: 'var(--or)', background: 'rgba(234,88,12,0.08)', padding: '8px 12px', borderRadius: 8, marginBottom: 16 }}>
              ⚠️ Nëse ka porosi të lidhura, çaktivizoje në vend të fshirjes.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setKonfirmFshij(null)} className="btn-secondary" style={{ flex: 1 }}>Anulo</button>
              <button onClick={() => fshij(konfirmFshij.id)} disabled={duke_fshij}
                style={{ flex: 1, padding: 10, background: 'var(--rd)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                {duke_fshij ? '...' : '🗑️ Fshij'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
