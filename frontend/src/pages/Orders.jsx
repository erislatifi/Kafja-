// ============================================================
// ORDERS PAGE - Historia e Porosive
// ============================================================
import { useState, useEffect } from 'react';
import api from '../services/api';
import { Printer, XCircle, Eye, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function ModalDetajePorosie({ porosia, onMbyll }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">Porosia #{porosia.numriPorosise}</h2>
          <button onClick={onMbyll} className="text-proit-muted hover:text-white"><X size={20} /></button>
        </div>
        <p className="text-sm text-proit-muted mb-1">Perdoruesi: <span className="text-white">{porosia.user?.emri}</span></p>
        <p className="text-sm text-proit-muted mb-3">Data: <span className="text-white">{new Date(porosia.krijuarMe).toLocaleString('sq-AL')}</span></p>
        <div className="border-t border-proit-border pt-3 space-y-2">
          {porosia.items.map((it) => (
            <div key={it.id} className="flex justify-between text-sm">
              <span className="text-white">{it.emriProduktit} x{Number(it.sasia)}</span>
              <span className="text-proit-lime">{Number(it.nentotali).toFixed(2)} €</span>
            </div>
          ))}
        </div>
        <div className="border-t border-proit-border mt-3 pt-3 flex justify-between font-bold">
          <span className="text-white">Totali</span>
          <span className="text-proit-lime">{Number(porosia.totali).toFixed(2)} €</span>
        </div>
      </div>
    </div>
  );
}

export default function Orders() {
  const [porosite, setPorosite] = useState([]);
  const [dukeNgarkuar, setDukeNgarkuar] = useState(true);
  const [detajetPorosi, setDetajetPorosi] = useState(null);
  const { kaRol } = useAuth();

  useEffect(() => {
    ngarko();
  }, []);

  async function ngarko() {
    setDukeNgarkuar(true);
    const { data } = await api.get('/orders');
    setPorosite(data);
    setDukeNgarkuar(false);
  }

  async function riprintoPorosine(id) {
    try {
      await api.post(`/orders/${id}/printo`);
      alert('Fatura u dergua per printim.');
    } catch (err) {
      alert(err.response?.data?.gabim || 'Gabim ne printim.');
    }
  }

  async function anuloPorosine(id) {
    if (!confirm('A jeni te sigurt qe doni ta anuloni kete porosi? Stoku do kthehet mbrapsht.')) return;
    try {
      await api.post(`/orders/${id}/anulo`);
      ngarko();
    } catch (err) {
      alert(err.response?.data?.gabim || 'Gabim ne anulim.');
    }
  }

  const statusBadge = {
    PERFUNDUAR: 'bg-proit-lime/20 text-proit-lime',
    ANULUAR: 'bg-red-900/30 text-red-400',
    AKTIVE: 'bg-blue-900/30 text-blue-400',
  };
  const statusLabel = { PERFUNDUAR: 'Perfunduar', ANULUAR: 'Anuluar', AKTIVE: 'Aktive' };

  return (
    <div>
      <h1 className="text-xl font-bold text-white mb-6">Porosite</h1>

      <div className="card p-0 overflow-hidden">
        {dukeNgarkuar ? (
          <div className="p-8 text-center text-proit-muted">Duke u ngarkuar...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-proit-dark border-b border-proit-border">
              <tr className="text-left text-proit-muted">
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Perdoruesi</th>
                <th className="px-4 py-3 font-medium text-right">Totali</th>
                <th className="px-4 py-3 font-medium text-center">Statusi</th>
                <th className="px-4 py-3 font-medium text-center">Veprime</th>
              </tr>
            </thead>
            <tbody>
              {porosite.map((p) => (
                <tr key={p.id} className="border-b border-proit-border last:border-0">
                  <td className="px-4 py-3 text-white font-semibold">#{p.numriPorosise}</td>
                  <td className="px-4 py-3 text-proit-muted">{new Date(p.krijuarMe).toLocaleString('sq-AL')}</td>
                  <td className="px-4 py-3 text-white">{p.user?.emri}</td>
                  <td className="px-4 py-3 text-right text-proit-lime font-semibold">{Number(p.totali).toFixed(2)} €</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`badge ${statusBadge[p.status]}`}>{statusLabel[p.status]}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-3">
                      <button onClick={() => setDetajetPorosi(p)} className="text-proit-muted hover:text-white" title="Shiko detajet">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => riprintoPorosine(p.id)} className="text-proit-muted hover:text-proit-lime" title="Ri-printo">
                        <Printer size={16} />
                      </button>
                      {kaRol('ADMIN', 'MENAXHER') && p.status !== 'ANULUAR' && (
                        <button onClick={() => anuloPorosine(p.id)} className="text-proit-muted hover:text-red-400" title="Anulo">
                          <XCircle size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {detajetPorosi && <ModalDetajePorosie porosia={detajetPorosi} onMbyll={() => setDetajetPorosi(null)} />}
    </div>
  );
}
