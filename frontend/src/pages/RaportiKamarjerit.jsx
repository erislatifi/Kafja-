import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function sot() { return new Date().toISOString().split('T')[0]; }

export default function RaportiKamarjerit({ onKthehu, onLogout }) {
  const { user, theme, toggleTheme } = useAuth();
  const [data, setData] = useState(sot());
  const [raporti, setRaporti] = useState(null);
  const [duke_ngarkuar, setDukeNgarkuar] = useState(false);
  const [filtri, setFiltri] = useState('te_gjitha'); // te_gjitha | pijet | ushqimet | arketimi

  useEffect(() => { ngarko(); }, [data]);

  async function ngarko() {
    setDukeNgarkuar(true);
    try {
      const { data: r } = await api.get(`/reports/kamerier?data=${data}&userId=${user?.id}`);
      setRaporti(r);
    } catch {
      // Demo data
      setRaporti({
        totali: 0, numriPorosive: 0,
        sipasKategorise: {},
        porosite: []
      });
    } finally { setDukeNgarkuar(false); }
  }

  const filtrimet = [
    { id: 'te_gjitha', lbl: 'Të Gjitha', ic: '📋' },
    { id: 'pijet', lbl: 'Pijet', ic: '☕' },
    { id: 'ushqimet', lbl: 'Ushqimet', ic: '🍽️' },
    { id: 'arketimi', lbl: 'Arketimi', ic: '💰' },
  ];

  const porosite = raporti?.porosite || [];
  const porositeFiltruara = filtri === 'arketimi'
    ? porosite
    : porosite;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* HEADER */}
      <div style={{ background: 'var(--bg2)', borderBottom: '1.5px solid var(--bd)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <button onClick={onKthehu} style={{ background: 'var(--bg3)', border: '1.5px solid var(--bd)', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontSize: 11, color: 'var(--mt)' }}>← Kthehu</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--tx)' }}>📊 Raporti Im Ditor</div>
          <div style={{ fontSize: 11, color: 'var(--mt)' }}>{user?.emri}</div>
        </div>
        <input type="date" value={data} onChange={e => setData(e.target.value)}
          style={{ width: 150, fontSize: 12 }} />
        <button onClick={toggleTheme} style={{ background: 'var(--bg3)', border: '1.5px solid var(--bd)', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontSize: 13 }}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button onClick={onLogout} style={{ background: 'rgba(220,38,38,0.08)', border: '1.5px solid rgba(220,38,38,0.2)', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: 'var(--rd)' }}>Dil</button>
      </div>

      <div style={{ flex: 1, padding: 14, overflowY: 'auto' }}>
        {duke_ngarkuar ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--mt)' }}>Duke u ngarkuar...</div>
        ) : (
          <>
            {/* KARTAT KRYESORE */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
              <div className="stat-kard">
                <div className="label">Totali i Ditës</div>
                <div className="vlera lime">{Number(raporti?.totali || 0).toFixed(2)} €</div>
              </div>
              <div className="stat-kard">
                <div className="label">Numri Porosive</div>
                <div className="vlera">{raporti?.numriPorosive || 0}</div>
              </div>
              <div className="stat-kard">
                <div className="label">Mesatarja / Porosi</div>
                <div className="vlera">{raporti?.numriPorosive > 0 ? (raporti.totali / raporti.numriPorosive).toFixed(2) : '0.00'} €</div>
              </div>
            </div>

            {/* FILTRAT */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              {filtrimet.map(f => (
                <button key={f.id} onClick={() => setFiltri(f.id)} style={{
                  padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                  background: filtri === f.id ? 'var(--lm)' : 'var(--bg2)',
                  color: filtri === f.id ? 'var(--ld)' : 'var(--tx)',
                  border: `1.5px solid ${filtri === f.id ? 'var(--lm)' : 'var(--bd)'}`,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5
                }}>{f.ic} {f.lbl}</button>
              ))}
            </div>

            {/* SIPAS KATEGORISË */}
            {filtri === 'te_gjitha' && Object.keys(raporti?.sipasKategorise || {}).length > 0 && (
              <div className="kard" style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx)', marginBottom: 10 }}>Sipas Kategorisë</div>
                {Object.entries(raporti.sipasKategorise).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--bd)' }}>
                    <span style={{ fontSize: 13, color: 'var(--tx)' }}>{k}</span>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <span style={{ fontSize: 12, color: 'var(--mt)' }}>{v.sasia}x</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--lm)' }}>{v.totali?.toFixed(2)} €</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* LISTA POROSIVE */}
            <div className="tabela">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Ora</th>
                    <th>Tavolina</th>
                    <th>Produktet</th>
                    <th>Totali</th>
                    {filtri === 'arketimi' && <th>Pagesa</th>}
                  </tr>
                </thead>
                <tbody>
                  {porositeFiltruara.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 30, color: 'var(--mt)' }}>
                      Nuk ka porosi për këtë datë.
                    </td></tr>
                  ) : porositeFiltruara.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 700 }}>#{p.numriPorosise}</td>
                      <td style={{ color: 'var(--mt)', fontSize: 12 }}>
                        {new Date(p.krijuarMe).toLocaleTimeString('sq-AL', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ fontWeight: 600 }}>Tav. {p.tavolinaNr || '—'}</td>
                      <td style={{ fontSize: 12 }}>
                        {(p.items || []).map(it => `${it.emriProduktit} x${it.sasia}`).join(', ')}
                      </td>
                      <td style={{ color: 'var(--lm)', fontWeight: 700 }}>{Number(p.totali).toFixed(2)} €</td>
                      {filtri === 'arketimi' && (
                        <td><span className={p.metodaPageses === 'card' ? 'badge-blue' : 'badge-green'}>
                          {p.metodaPageses === 'card' ? '💳 Kartë' : '💵 Cash'}
                        </span></td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* TOTALI POSHTË */}
            {porositeFiltruara.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                <div style={{ background: 'var(--bg2)', border: '1.5px solid var(--lm)', borderRadius: 10, padding: '10px 20px', display: 'flex', gap: 16, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--mt)' }}>TOTALI I DITËS:</span>
                  <span style={{ fontSize: 22, fontWeight: 900, color: 'var(--lm)' }}>{Number(raporti?.totali || 0).toFixed(2)} €</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ borderTop: '1.5px solid var(--bd)', padding: '6px', textAlign: 'center', background: 'var(--bg2)' }}>
        <img src="/logo-proit.png" alt="PRO IT" style={{ height: 18, objectFit: 'contain', opacity: 0.5 }} />
      </div>
    </div>
  );
}
