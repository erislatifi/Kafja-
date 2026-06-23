import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function POSTouch({ tavolina, onKthehu, onPorosiaSuksesshme }) {
  const [produktet, setProduktet] = useState([]);
  const [kategorite, setKategorite] = useState([]);
  const [kategoriaAktive, setKategoriaAktive] = useState('Te Gjitha');
  const [shporta, setShporta] = useState([]);
  const [duke_ruajtur, setDukeRuajtur] = useState(false);
  const [gabim, setGabim] = useState('');
  const { user, theme, toggleTheme } = useAuth();

  useEffect(() => {
    async function ngarko() {
      try {
        const [resProd, resKat] = await Promise.all([
          api.get('/products?aktiv=true'),
          api.get('/products/categories/all')
        ]);
        setProduktet(resProd.data);
        setKategorite(resKat.data);
      } catch { }
    }
    ngarko();
  }, []);

  const produktetFiltruara = useMemo(() => {
    if (kategoriaAktive === 'Te Gjitha') return produktet;
    return produktet.filter(p => p.category?.emri === kategoriaAktive);
  }, [produktet, kategoriaAktive]);

  function shto(p) {
    setShporta(prev => {
      const ex = prev.find(x => x.id === p.id);
      if (ex) {
        if (ex.sasia >= Number(p.sasiaStok)) return prev;
        return prev.map(x => x.id === p.id ? { ...x, sasia: x.sasia + 1 } : x);
      }
      if (Number(p.sasiaStok) < 1) return prev;
      return [...prev, { id: p.id, emri: p.emri, cmimi: Number(p.cmimiShitjes), sasia: 1, emoji: p.category?.ikona || '📦' }];
    });
  }

  function ndryshoSasi(id, delta) {
    setShporta(prev =>
      prev.map(x => x.id === id ? { ...x, sasia: x.sasia + delta } : x)
        .filter(x => x.sasia > 0)
    );
  }

  const totali = useMemo(() => shporta.reduce((s, x) => s + x.cmimi * x.sasia, 0), [shporta]);

  async function konfirmo() {
    if (!shporta.length) return;
    setDukeRuajtur(true);
    setGabim('');
    try {
      await api.post('/orders', {
        items: shporta.map(x => ({ productId: x.id, sasia: x.sasia })),
        tavolinaNr: tavolina?.numri
      });
      onPorosiaSuksesshme(totali, tavolina?.numri);
    } catch (err) {
      setGabim(err.response?.data?.gabim || 'Gabim gjate ruajtjes.');
      setDukeRuajtur(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* TOP BAR */}
      <div style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--bd)', padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={onKthehu} style={{ background: 'var(--bg3)', border: '1px solid var(--bd)', borderRadius: 7, padding: '5px 11px', cursor: 'pointer', fontSize: 11, color: 'var(--mt)' }}>
          ← Tavolinat
        </button>
        <div style={{ background: 'var(--lm)', color: 'var(--ld)', borderRadius: 7, padding: '5px 14px', fontSize: 12, fontWeight: 700 }}>
          Tav. {tavolina?.numri}
        </div>
        <div style={{ fontSize: 11, color: 'var(--mt)', marginLeft: 'auto' }}>{user?.emri}</div>
        <button onClick={toggleTheme} style={{ background: 'var(--bg3)', border: '1px solid var(--bd)', borderRadius: 20, padding: '4px 10px', cursor: 'pointer', fontSize: 11, color: 'var(--mt)' }}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* PRODUKTET */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 10, minWidth: 0 }}>
          {/* KATEGORITE */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 10, overflowX: 'auto', flexShrink: 0, paddingBottom: 4 }}>
            {['Te Gjitha', ...kategorite.map(k => k.emri)].map(kat => (
              <button key={kat} onClick={() => setKategoriaAktive(kat)} style={{
                flexShrink: 0, padding: '7px 14px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                cursor: 'pointer', whiteSpace: 'nowrap',
                background: kategoriaAktive === kat ? 'var(--lm)' : 'var(--bg3)',
                color: kategoriaAktive === kat ? 'var(--ld)' : 'var(--mt)',
                border: `1.5px solid ${kategoriaAktive === kat ? 'var(--lm)' : 'var(--bd)'}`
              }}>{kat}</button>
            ))}
          </div>

          {/* KARTELA PRODUKTESH */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, alignContent: 'start' }}>
            {produktetFiltruara.map(p => (
              <div key={p.id} onClick={() => shto(p)} style={{
                background: 'var(--bg3)', border: '1.5px solid var(--bd)',
                borderRadius: 10, padding: '12px 8px', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                transition: 'all 0.12s', textAlign: 'center',
                opacity: Number(p.sasiaStok) <= 0 ? 0.3 : 1,
                pointerEvents: Number(p.sasiaStok) <= 0 ? 'none' : 'auto'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--lm)'; e.currentTarget.style.transform = 'scale(0.97)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--bd)'; e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <div style={{ fontSize: 26 }}>{p.category?.ikona || '📦'}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--tx)', lineHeight: 1.2 }}>{p.emri}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--lm)' }}>{Number(p.cmimiShitjes).toFixed(2)} €</div>
              </div>
            ))}
          </div>
        </div>

        {/* SHPORTA */}
        <div style={{ width: 210, background: 'var(--bg2)', borderLeft: '1px solid var(--bd)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--bd)', display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--tx)', flex: 1 }}>🛒 Porosia</span>
            {shporta.length > 0 && (
              <span onClick={() => setShporta([])} style={{ fontSize: 10, color: 'var(--rd)', cursor: 'pointer' }}>Pastro</span>
            )}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 7 }}>
            {shporta.length === 0 ? (
              <p style={{ color: 'var(--mt)', fontSize: 11, padding: '14px 6px', textAlign: 'center' }}>Shporta është bosh.</p>
            ) : shporta.map(it => (
              <div key={it.id} style={{ background: 'var(--bg3)', borderRadius: 7, padding: 7, marginBottom: 5 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--tx)', marginBottom: 5 }}>{it.emri}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <button onClick={() => ndryshoSasi(it.id, -1)} style={{ width: 22, height: 22, borderRadius: 5, background: 'var(--bd)', border: 'none', color: 'var(--tx)', cursor: 'pointer', fontSize: 14 }}>-</button>
                    <span style={{ fontSize: 12, fontWeight: 700, minWidth: 16, textAlign: 'center' }}>{it.sasia}</span>
                    <button onClick={() => ndryshoSasi(it.id, 1)} style={{ width: 22, height: 22, borderRadius: 5, background: 'var(--bd)', border: 'none', color: 'var(--tx)', cursor: 'pointer', fontSize: 14 }}>+</button>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--lm)' }}>{(it.cmimi * it.sasia).toFixed(2)} €</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: 10, borderTop: '1px solid var(--bd)' }}>
            {gabim && <div style={{ fontSize: 10, color: 'var(--rd)', marginBottom: 6 }}>{gabim}</div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--mt)' }}>Totali</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--lm)' }}>{totali.toFixed(2)} €</span>
            </div>
            <button onClick={konfirmo} disabled={shporta.length === 0 || duke_ruajtur} style={{
              width: '100%', padding: 10, background: 'var(--lm)', color: 'var(--ld)',
              border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700,
              cursor: shporta.length === 0 ? 'default' : 'pointer',
              opacity: shporta.length === 0 ? 0.35 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5
            }}>
              🖨️ {duke_ruajtur ? 'Duke ruajtur...' : 'Shto në Tabelë'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
