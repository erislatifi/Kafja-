// ============================================================
// REPORTS PAGE - Raporte Ditore/Mujore + Eksport
// ============================================================
import { useState, useEffect } from 'react';
import api from '../services/api';
import { FileDown, FileSpreadsheet, Calendar } from 'lucide-react';

function avuiSot() {
  return new Date().toISOString().split('T')[0];
}

export default function Reports() {
  const [tab, setTab] = useState('DITOR');
  const [data, setData] = useState(avuiSot());
  const [raportiDitor, setRaportiDitor] = useState(null);
  const [raportiMujor, setRaportiMujor] = useState(null);
  const [viti, setViti] = useState(new Date().getFullYear());
  const [muaji, setMuaji] = useState(new Date().getMonth() + 1);
  const [dukeNgarkuar, setDukeNgarkuar] = useState(true);

  useEffect(() => {
    if (tab === 'DITOR') ngarkoDitor();
    else ngarkoMujor();
  }, [tab, data, viti, muaji]);

  async function ngarkoDitor() {
    setDukeNgarkuar(true);
    const { data: res } = await api.get(`/reports/ditor?data=${data}`);
    setRaportiDitor(res);
    setDukeNgarkuar(false);
  }

  async function ngarkoMujor() {
    setDukeNgarkuar(true);
    const { data: res } = await api.get(`/reports/mujor?viti=${viti}&muaji=${muaji}`);
    setRaportiMujor(res);
    setDukeNgarkuar(false);
  }

  async function eksporto(formati) {
    const token = localStorage.getItem('kafe_nlagje_token');
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
    const url = `${apiUrl}/reports/ditor/eksport/${formati}?data=${data}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const blob = await res.blob();
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `raporti-${data}.${formati === 'pdf' ? 'pdf' : 'xlsx'}`;
    link.click();
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-white mb-6">Raportet</h1>

      <div className="flex gap-2 mb-5">
        <button onClick={() => setTab('DITOR')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'DITOR' ? 'bg-proit-lime text-proit-black' : 'bg-proit-panel text-proit-muted'}`}>
          Raporti Ditor
        </button>
        <button onClick={() => setTab('MUJOR')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'MUJOR' ? 'bg-proit-lime text-proit-black' : 'bg-proit-panel text-proit-muted'}`}>
          Raporti Mujor
        </button>
      </div>

      {tab === 'DITOR' && (
        <>
          <div className="flex items-center gap-3 mb-5">
            <Calendar size={18} className="text-proit-muted" />
            <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="input-field w-44" />
            <button onClick={() => eksporto('pdf')} className="btn-secondary flex items-center gap-2 text-sm">
              <FileDown size={16} /> PDF
            </button>
            <button onClick={() => eksporto('excel')} className="btn-secondary flex items-center gap-2 text-sm">
              <FileSpreadsheet size={16} /> Excel
            </button>
          </div>

          {dukeNgarkuar || !raportiDitor ? (
            <p className="text-proit-muted">Duke u ngarkuar...</p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="card">
                  <p className="text-proit-muted text-sm mb-1">Totali i Shitjes</p>
                  <p className="text-2xl font-bold text-proit-lime">{raportiDitor.totaliShitjes.toFixed(2)} €</p>
                </div>
                <div className="card">
                  <p className="text-proit-muted text-sm mb-1">Numri i Porosive</p>
                  <p className="text-2xl font-bold text-white">{raportiDitor.numriPorosive}</p>
                </div>
                <div className="card">
                  <p className="text-proit-muted text-sm mb-1">Fitimi Ditor</p>
                  <p className="text-2xl font-bold text-white">{raportiDitor.fitimiDitor.toFixed(2)} €</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="font-semibold text-white mb-3">Sipas Kategorise</h3>
                  <div className="space-y-2">
                    {Object.entries(raportiDitor.sipasKategorise).map(([kat, td]) => (
                      <div key={kat} className="flex justify-between text-sm">
                        <span className="text-white">{kat}</span>
                        <span className="text-proit-muted">{td.sasia} njesi — <span className="text-proit-lime font-semibold">{td.totali.toFixed(2)} €</span></span>
                      </div>
                    ))}
                    {Object.keys(raportiDitor.sipasKategorise).length === 0 && (
                      <p className="text-proit-muted text-sm">Asnje shitje per kete date.</p>
                    )}
                  </div>
                </div>

                <div className="card">
                  <h3 className="font-semibold text-white mb-3">Produktet me te Shitura</h3>
                  <div className="space-y-2">
                    {raportiDitor.produktetMeShituara.map((p, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-white">{i + 1}. {p.emri}</span>
                        <span className="text-proit-lime font-semibold">{p.sasia}x — {p.totali.toFixed(2)} €</span>
                      </div>
                    ))}
                    {raportiDitor.produktetMeShituara.length === 0 && (
                      <p className="text-proit-muted text-sm">Asnje shitje per kete date.</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {tab === 'MUJOR' && (
        <>
          <div className="flex items-center gap-3 mb-5">
            <select className="input-field w-32" value={muaji} onChange={(e) => setMuaji(Number(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2024, i).toLocaleDateString('sq-AL', { month: 'long' })}
                </option>
              ))}
            </select>
            <select className="input-field w-28" value={viti} onChange={(e) => setViti(Number(e.target.value))}>
              {[2024, 2025, 2026, 2027].map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          {dukeNgarkuar || !raportiMujor ? (
            <p className="text-proit-muted">Duke u ngarkuar...</p>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              <div className="card">
                <p className="text-proit-muted text-sm mb-1">Totali i Shitjes</p>
                <p className="text-2xl font-bold text-proit-lime">{raportiMujor.totaliShitjes.toFixed(2)} €</p>
              </div>
              <div className="card">
                <p className="text-proit-muted text-sm mb-1">Numri i Porosive</p>
                <p className="text-2xl font-bold text-white">{raportiMujor.numriPorosive}</p>
              </div>
              <div className="card">
                <p className="text-proit-muted text-sm mb-1">Mesatarja Ditore</p>
                <p className="text-2xl font-bold text-white">{raportiMujor.mesatarjaDitore.toFixed(2)} €</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
