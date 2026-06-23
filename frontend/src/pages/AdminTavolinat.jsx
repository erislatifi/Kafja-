import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

const GRID_COLS = 5;
const GRID_ROWS = 3;

export default function AdminTavolinat() {
  const [tavolinat, setTavolinat] = useState([]);
  const [duke_ruajtur, setDukeRuajtur] = useState(false);
  const [mesazh, setMesazh] = useState(null);
  const [dragTav, setDragTav] = useState(null);
  const [modalEdito, setModalEdito] = useState(null);
  const [editForma, setEditForma] = useState({ emri: '', numri: '' });

  useEffect(() => { ngarko(); }, []);

  async function ngarko() {
    try {
      const { data } = await api.get('/tables');
      setTavolinat(data);
    } catch {
      // Krijo tavolina default nëse nuk ekzistojnë
      setTavolinat(Array.from({ length: 15 }, (_, i) => ({
        id: i + 1, numri: i + 1, emri: null,
        pozicioniX: i % GRID_COLS, pozicioniY: Math.floor(i / GRID_COLS),
        aktiv: true
      })));
    }
  }

  // Ndërto grid 5x3
  const grid = Array.from({ length: GRID_ROWS }, (_, y) =>
    Array.from({ length: GRID_COLS }, (_, x) => {
      return tavolinat.find(t => t.pozicioniX === x && t.pozicioniY === y) || null;
    })
  );

  function onDragStart(tav) { setDragTav(tav); }

  async function onDrop(x, y) {
    if (!dragTav) return;
    const tjetri = tavolinat.find(t => t.pozicioniX === x && t.pozicioniY === y);

    const tavolinatRi = tavolinat.map(t => {
      if (t.id === dragTav.id) return { ...t, pozicioniX: x, pozicioniY: y };
      if (tjetri && t.id === tjetri.id) return { ...t, pozicioniX: dragTav.pozicioniX, pozicioniY: dragTav.pozicioniY };
      return t;
    });
    setTavolinat(tavolinatRi);
    setDragTav(null);
  }

  async function ruajPozicionet() {
    setDukeRuajtur(true);
    try {
      await Promise.all(tavolinat.map(t =>
        api.put(`/tables/${t.id}`, { pozicioniX: t.pozicioniX, pozicioniY: t.pozicioniY }).catch(() => {})
      ));
      setMesazh({ tip: 'ok', tekst: 'Pozicionet u ruajtën!' });
      setTimeout(() => setMesazh(null), 3000);
    } catch {
      setMesazh({ tip: 'err', tekst: 'Gabim gjate ruajtjes.' });
    } finally { setDukeRuajtur(false); }
  }

  async function ruajEditimin() {
    if (!modalEdito) return;
    try {
      await api.put(`/tables/${modalEdito.id}`, {
        emri: editForma.emri || null,
        numri: parseInt(editForma.numri) || modalEdito.numri
      }).catch(() => {});
      setTavolinat(prev => prev.map(t =>
        t.id === modalEdito.id
          ? { ...t, emri: editForma.emri || null, numri: parseInt(editForma.numri) || t.numri }
          : t
      ));
      setModalEdito(null);
      setMesazh({ tip: 'ok', tekst: 'Tavolina u ruajt!' });
      setTimeout(() => setMesazh(null), 2000);
    } catch {
      setMesazh({ tip: 'err', tekst: 'Gabim.' });
    }
  }

  async function shtoTavolina() {
    const numriRi = Math.max(...tavolinat.map(t => t.numri), 0) + 1;
    const poziBosh = (() => {
      for (let y = 0; y < GRID_ROWS; y++)
        for (let x = 0; x < GRID_COLS; x++)
          if (!tavolinat.find(t => t.pozicioniX === x && t.pozicioniY === y))
            return { x, y };
      return { x: 0, y: 0 };
    })();
    try {
      const { data } = await api.post('/tables', { numri: numriRi, pozicioniX: poziBosh.x, pozicioniY: poziBosh.y }).catch(() => ({ data: { id: Date.now(), numri: numriRi, emri: null, pozicioniX: poziBosh.x, pozicioniY: poziBosh.y, aktiv: true } }));
      setTavolinat(prev => [...prev, data]);
    } catch { ngarko(); }
  }

  async function fshijTavolinen(tav) {
    if (!confirm(`Fshij Tavolinën ${tav.numri}?`)) return;
    try {
      await api.delete(`/tables/${tav.id}`).catch(() => {});
      setTavolinat(prev => prev.filter(t => t.id !== tav.id));
    } catch { }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--tx)' }}>Menaxhimi i Tavolinave</div>
          <div style={{ fontSize: 12, color: 'var(--mt)', marginTop: 2 }}>Tërhiq & lësho për të ndërruar pozicionin</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={shtoTavolina} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            + Tavolinë e Re
          </button>
          <button onClick={ruajPozicionet} disabled={duke_ruajtur} className="btn-primary">
            {duke_ruajtur ? 'Duke ruajtur...' : '💾 Ruaj Pozicionet'}
          </button>
        </div>
      </div>

      {mesazh && (
        <div style={{ marginBottom: 14, padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: mesazh.tip === 'ok' ? 'rgba(90,158,15,0.1)' : 'rgba(220,38,38,0.08)', color: mesazh.tip === 'ok' ? 'var(--lm)' : 'var(--rd)', border: `1px solid ${mesazh.tip === 'ok' ? 'var(--lm)' : 'var(--rd)'}` }}>
          {mesazh.tekst}
        </div>
      )}

      {/* INFO */}
      <div style={{ background: 'rgba(37,99,235,0.06)', border: '1.5px solid rgba(37,99,235,0.2)', borderRadius: 10, padding: '8px 14px', marginBottom: 16, fontSize: 12, color: 'var(--tx)' }}>
        💡 Kliko <strong>✏️</strong> për të ndryshuar numrin ose emrin e tavolinës. Tërhiq & lësho për të ndërruar pozicionin. Kliko <strong>💾 Ruaj</strong> pas ndryshimeve.
      </div>

      {/* GRID DRAG & DROP */}
      <div style={{ background: 'var(--bg2)', border: '1.5px solid var(--bd)', borderRadius: 14, padding: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`, gridTemplateRows: `repeat(${GRID_ROWS}, 100px)`, gap: 10 }}>
          {grid.map((row, y) =>
            row.map((tav, x) => (
              <div key={`${x}-${y}`}
                onDragOver={e => e.preventDefault()}
                onDrop={() => onDrop(x, y)}
                style={{
                  borderRadius: 10,
                  border: `2px dashed ${tav ? 'var(--bd)' : 'rgba(0,0,0,0.08)'}`,
                  background: tav ? 'var(--bg3)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', transition: 'all 0.12s'
                }}>
                {tav ? (
                  <div
                    draggable
                    onDragStart={() => onDragStart(tav)}
                    style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'grab', borderRadius: 10, userSelect: 'none' }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--tx)' }}>{tav.numri}</div>
                    {tav.emri && <div style={{ fontSize: 10, color: 'var(--lm)', fontWeight: 600, marginTop: 2 }}>{tav.emri}</div>}
                    <div style={{ fontSize: 10, color: 'var(--mt)', marginTop: 2 }}>🪑</div>
                    {/* Butonat */}
                    <div style={{ position: 'absolute', top: 4, right: 4, display: 'flex', gap: 3 }}>
                      <button onClick={e => { e.stopPropagation(); setModalEdito(tav); setEditForma({ emri: tav.emri || '', numri: String(tav.numri) }); }}
                        style={{ background: 'var(--bg2)', border: '1px solid var(--bd)', borderRadius: 4, padding: '2px 5px', cursor: 'pointer', fontSize: 10 }}>✏️</button>
                      <button onClick={e => { e.stopPropagation(); fshijTavolinen(tav); }}
                        style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 4, padding: '2px 5px', cursor: 'pointer', fontSize: 10 }}>🗑️</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: 10, color: 'var(--bd)', textAlign: 'center' }}>bosh</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL EDITO */}
      {modalEdito && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 320 }}>
            <div className="modal-title">✏️ Edito Tavolinën {modalEdito.numri}</div>
            <div className="form-group">
              <label className="form-label">Numri i Tavolinës</label>
              <input type="number" min="1" value={editForma.numri}
                onChange={e => setEditForma({ ...editForma, numri: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Emri / Etiketa (opsional)</label>
              <input value={editForma.emri} onChange={e => setEditForma({ ...editForma, emri: e.target.value })}
                placeholder="p.sh. VIP, Ballkoni, Terrasa" />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button onClick={() => setModalEdito(null)} className="btn-secondary" style={{ flex: 1 }}>Anulo</button>
              <button onClick={ruajEditimin} className="btn-primary" style={{ flex: 2 }}>✓ Ruaj</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
