// ============================================================
// SETTINGS PAGE - Konfigurimi i Printereve
// ============================================================
import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Pencil, Trash2, X, Printer as PrinterIcon, CheckCircle, Zap } from 'lucide-react';

function ModalPrinter({ printeri, onMbyll, onRuajt }) {
  const [forma, setForma] = useState(
    printeri || { emri: '', lidhja: 'USB', gjeresiaMM: 80, pathUSB: '/dev/usb/lp0', ipAdresa: '', porti: 9100, parazgjedhur: false }
  );
  const [dukeRuajtur, setDukeRuajtur] = useState(false);
  const [gabim, setGabim] = useState('');

  async function dorezo(e) {
    e.preventDefault();
    setDukeRuajtur(true);
    setGabim('');
    try {
      await onRuajt(forma);
    } catch (err) {
      setGabim(err.response?.data?.gabim || 'Gabim gjate ruajtjes.');
    } finally {
      setDukeRuajtur(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">{printeri ? 'Edito Printerin' : 'Printer i Ri'}</h2>
          <button onClick={onMbyll} className="text-proit-muted hover:text-white"><X size={20} /></button>
        </div>

        {gabim && <div className="bg-red-900/20 border border-red-800 text-red-300 text-sm px-3 py-2 rounded-lg mb-3">{gabim}</div>}

        <form onSubmit={dorezo} className="space-y-3">
          <div>
            <label className="label-field">Emri</label>
            <input required className="input-field" value={forma.emri} onChange={(e) => setForma({ ...forma, emri: e.target.value })} placeholder="p.sh. Printeri Kryesor" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-field">Lidhja</label>
              <select className="input-field" value={forma.lidhja} onChange={(e) => setForma({ ...forma, lidhja: e.target.value })}>
                <option value="USB">USB</option>
                <option value="NETWORK">Network (IP)</option>
              </select>
            </div>
            <div>
              <label className="label-field">Gjeresia</label>
              <select className="input-field" value={forma.gjeresiaMM} onChange={(e) => setForma({ ...forma, gjeresiaMM: Number(e.target.value) })}>
                <option value={58}>58mm</option>
                <option value={80}>80mm</option>
              </select>
            </div>
          </div>

          {forma.lidhja === 'USB' ? (
            <div>
              <label className="label-field">Path-i USB (Linux)</label>
              <input className="input-field" value={forma.pathUSB || ''} onChange={(e) => setForma({ ...forma, pathUSB: e.target.value })} placeholder="/dev/usb/lp0" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-field">IP Adresa</label>
                <input className="input-field" value={forma.ipAdresa || ''} onChange={(e) => setForma({ ...forma, ipAdresa: e.target.value })} placeholder="192.168.1.50" />
              </div>
              <div>
                <label className="label-field">Porti</label>
                <input type="number" className="input-field" value={forma.porti || 9100} onChange={(e) => setForma({ ...forma, porti: Number(e.target.value) })} />
              </div>
            </div>
          )}

          <label className="flex items-center gap-2 text-sm text-white">
            <input type="checkbox" checked={forma.parazgjedhur} onChange={(e) => setForma({ ...forma, parazgjedhur: e.target.checked })} className="accent-proit-lime" />
            Vendose si printer parazgjedhur
          </label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onMbyll} className="btn-secondary flex-1 justify-center flex">Anulo</button>
            <button type="submit" disabled={dukeRuajtur} className="btn-primary flex-1 justify-center flex">
              {dukeRuajtur ? 'Duke ruajtur...' : 'Ruaj'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Settings() {
  const [printeret, setPrinteret] = useState([]);
  const [dukeNgarkuar, setDukeNgarkuar] = useState(true);
  const [modalHapur, setModalHapur] = useState(false);
  const [printeriNeEditim, setPrinteriNeEditim] = useState(null);
  const [mesazhTest, setMesazhTest] = useState(null);

  useEffect(() => {
    ngarko();
  }, []);

  async function ngarko() {
    setDukeNgarkuar(true);
    const { data } = await api.get('/printers');
    setPrinteret(data);
    setDukeNgarkuar(false);
  }

  async function ruajPrinterin(forma) {
    if (forma.id) {
      await api.put(`/printers/${forma.id}`, forma);
    } else {
      await api.post('/printers', forma);
    }
    setModalHapur(false);
    setPrinteriNeEditim(null);
    ngarko();
  }

  async function fshijPrinterin(id) {
    if (!confirm('A jeni te sigurt?')) return;
    await api.delete(`/printers/${id}`);
    ngarko();
  }

  async function testoPrinterin(id) {
    setMesazhTest(null);
    try {
      const { data } = await api.post(`/printers/${id}/test`);
      setMesazhTest({ tip: 'sukses', tekst: data.mesazh });
    } catch (err) {
      setMesazhTest({ tip: 'gabim', tekst: err.response?.data?.gabim || 'Gabim gjate testimit.' });
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-white">Cilesimet — Printeret</h1>
        <button onClick={() => { setPrinteriNeEditim(null); setModalHapur(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Printer i Ri
        </button>
      </div>

      {mesazhTest && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${mesazhTest.tip === 'sukses' ? 'bg-proit-lime/10 border border-proit-lime text-proit-lime' : 'bg-red-900/20 border border-red-800 text-red-300'}`}>
          {mesazhTest.tekst}
        </div>
      )}

      {dukeNgarkuar ? (
        <p className="text-proit-muted">Duke u ngarkuar...</p>
      ) : printeret.length === 0 ? (
        <div className="card text-center py-10">
          <PrinterIcon size={32} className="text-proit-muted mx-auto mb-3" />
          <p className="text-proit-muted">Nuk eshte konfiguruar asnje printer akoma.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {printeret.map((p) => (
            <div key={p.id} className="card">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <PrinterIcon size={20} className="text-proit-lime" />
                  <div>
                    <p className="font-semibold text-white">{p.emri}</p>
                    {p.parazgjedhur && (
                      <span className="badge bg-proit-lime/20 text-proit-lime mt-1 inline-flex items-center gap-1">
                        <CheckCircle size={10} /> Parazgjedhur
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setPrinteriNeEditim(p); setModalHapur(true); }} className="text-proit-muted hover:text-proit-lime">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => fshijPrinterin(p.id)} className="text-proit-muted hover:text-red-400">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-proit-muted mb-1">Lidhja: <span className="text-white">{p.lidhja}</span> • {p.gjeresiaMM}mm</p>
              <p className="text-sm text-proit-muted mb-3">
                {p.lidhja === 'USB' ? p.pathUSB : `${p.ipAdresa}:${p.porti}`}
              </p>
              <button onClick={() => testoPrinterin(p.id)} className="btn-secondary text-sm flex items-center gap-2">
                <Zap size={14} /> Testo Printerin
              </button>
            </div>
          ))}
        </div>
      )}

      {modalHapur && (
        <ModalPrinter
          printeri={printeriNeEditim}
          onMbyll={() => { setModalHapur(false); setPrinteriNeEditim(null); }}
          onRuajt={ruajPrinterin}
        />
      )}
    </div>
  );
}
