import { useState, useEffect } from 'react';
import api from '../services/api';

function sot() { return new Date().toISOString().split('T')[0]; }

export default function Reports() {
  const [tab, setTab] = useState('ditor');
  const [data, setData] = useState(sot());
  const [viti, setViti] = useState(new Date().getFullYear());
  const [muaji, setMuaji] = useState(new Date().getMonth() + 1);
  const [rd, setRd] = useState(null); // raporti ditor
  const [rm, setRm] = useState(null); // raporti mujor
  const [duke_ngarkuar, setDukeNgarkuar] = useState(false);

  useEffect(() => { ngarko(); }, [tab, data, viti, muaji]);

  async function ngarko() {
    setDukeNgarkuar(true);
    try {
      if (tab === 'ditor') {
        const { data: r } = await api.get(`/reports/ditor?data=${data}`);
        setRd(r);
      } else {
        const { data: r } = await api.get(`/reports/mujor?viti=${viti}&muaji=${muaji}`);
        setRm(r);
      }
    } catch { } finally { setDukeNgarkuar(false); }
  }

  async function eksporto(formati) {
    const token = localStorage.getItem('kafe_nlagje_token');
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
    const url = `${apiUrl}/reports/ditor/eksport/${formati}?data=${data}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const blob = await res.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `raporti-${data}.${formati === 'pdf' ? 'pdf' : 'xlsx'}`;
    link.click();
  }

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--tx)', marginBottom: 18 }}>Raportet</div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        {[['ditor', 'Raporti Ditor'], ['mujor', 'Raporti Mujor']].map(([v, l]) => (
          <button key={v} onClick={() => setTab(v)} style={{
            padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: tab === v ? 'var(--lm)' : 'var(--bg3)',
            color: tab === v ? 'var(--ld)' : 'var(--tx)',
            border: `1.5px solid ${tab === v ? 'var(--lm)' : 'var(--bd)'}`,
          }}>{l}</button>
        ))}
      </div>

      {tab === 'ditor' && (
        <>
          {/* FILTRAT */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
            <input type="date" value={data} onChange={e => setData(e.target.value)} style={{ width: 160 }} />
            <button onClick={() => eksporto('pdf')} style={{ padding: '8px 16px', background: 'var(--bg3)', border: '1.5px solid var(--bd)', borderRadius: 8, fontSize: 12, color: 'var(--tx)', display: 'flex', alignItems: 'center', gap: 6 }}>
              📄 PDF
            </button>
            <button onClick={() => eksporto('excel')} style={{ padding: '8px 16px', background: 'var(--bg3)', border: '1.5px solid var(--bd)', borderRadius: 8, fontSize: 12, color: 'var(--tx)', display: 'flex', alignItems: 'center', gap: 6 }}>
              📊 Excel
            </button>
          </div>

          {duke_ngarkuar ? <div style={{ color: 'var(--mt)' }}>Duke u ngarkuar...</div> : rd && (
            <>
              {/* KARTAT */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 18 }}>
                <div className="stat-kard"><div className="label">Totali i Shitjes</div><div className="vlera lime">{rd.totaliShitjes?.toFixed(2)} €</div></div>
                <div className="stat-kard"><div className="label">Numri i Porosive</div><div className="vlera">{rd.numriPorosive}</div></div>
                <div className="stat-kard"><div className="label">Fitimi Ditor</div><div className="vlera">{rd.fitimiDitor?.toFixed(2)} €</div></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="kard">
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx)', marginBottom: 12 }}>Sipas Kategorise</div>
                  {Object.entries(rd.sipasKategorise || {}).length === 0
                    ? <div style={{ color: 'var(--mt)', fontSize: 12 }}>Asnje shitje per kete date.</div>
                    : Object.entries(rd.sipasKategorise).map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--bd)', fontSize: 13 }}>
                        <span style={{ color: 'var(--tx)' }}>{k}</span>
                        <span style={{ color: 'var(--lm)', fontWeight: 700 }}>{v.totali?.toFixed(2)} €</span>
                      </div>
                    ))}
                </div>

                <div className="kard">
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx)', marginBottom: 12 }}>Produktet me te Shitura</div>
                  {rd.produktetMeShituara?.length === 0
                    ? <div style={{ color: 'var(--mt)', fontSize: 12 }}>Asnje shitje per kete date.</div>
                    : rd.produktetMeShituara?.map((p, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--bd)', fontSize: 13 }}>
                        <span style={{ color: 'var(--tx)' }}>{i + 1}. {p.emri}</span>
                        <span style={{ color: 'var(--lm)', fontWeight: 700 }}>{p.sasia}x — {p.totali?.toFixed(2)} €</span>
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}
        </>
      )}

      {tab === 'mujor' && (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
            <select value={muaji} onChange={e => setMuaji(Number(e.target.value))} style={{ width: 160 }}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2024, i).toLocaleDateString('sq-AL', { month: 'long' })}
                </option>
              ))}
            </select>
            <select value={viti} onChange={e => setViti(Number(e.target.value))} style={{ width: 120 }}>
              {[2024, 2025, 2026, 2027].map(v => <option key={v}>{v}</option>)}
            </select>
          </div>

          {duke_ngarkuar ? <div style={{ color: 'var(--mt)' }}>Duke u ngarkuar...</div> : rm && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
              <div className="stat-kard"><div className="label">Totali Mujor</div><div className="vlera lime">{rm.totaliShitjes?.toFixed(2)} €</div></div>
              <div className="stat-kard"><div className="label">Numri i Porosive</div><div className="vlera">{rm.numriPorosive}</div></div>
              <div className="stat-kard"><div className="label">Mesatarja Ditore</div><div className="vlera">{rm.mesatarjaDitore?.toFixed(2)} €</div></div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
