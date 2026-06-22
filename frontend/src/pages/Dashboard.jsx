// ============================================================
// DASHBOARD PAGE - Permbledhje + Grafika
// ============================================================
import { useState, useEffect } from 'react';
import api from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, ShoppingBag, TrendingUp, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const [te_dhena, setTeDhena] = useState(null);
  const [dukeNgarkuar, setDukeNgarkuar] = useState(true);

  useEffect(() => {
    api
      .get('/reports/dashboard')
      .then((res) => setTeDhena(res.data))
      .finally(() => setDukeNgarkuar(false));
  }, []);

  if (dukeNgarkuar) {
    return <div className="text-proit-muted">Duke u ngarkuar...</div>;
  }

  if (!te_dhena) {
    return <div className="text-red-400">Gabim ne ngarkimin e te dhenave.</div>;
  }

  const grafikuData = Object.entries(te_dhena.grafiku7Dite).map(([data, totali]) => ({
    data: new Date(data).toLocaleDateString('sq-AL', { day: '2-digit', month: '2-digit' }),
    totali: Math.round(totali * 100) / 100,
  }));

  return (
    <div>
      <h1 className="text-xl font-bold text-white mb-6">Dashboard</h1>

      {/* KARTAT KRYESORE */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-proit-muted text-sm">Shitjet e Sotme</span>
            <DollarSign size={18} className="text-proit-lime" />
          </div>
          <p className="text-2xl font-bold text-white">{te_dhena.totaliSot.toFixed(2)} €</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-proit-muted text-sm">Numri i Porosive</span>
            <ShoppingBag size={18} className="text-proit-lime" />
          </div>
          <p className="text-2xl font-bold text-white">{te_dhena.numriPorosiveSot}</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-proit-muted text-sm">Produkti Kryesor</span>
            <TrendingUp size={18} className="text-proit-lime" />
          </div>
          <p className="text-lg font-bold text-white truncate">
            {te_dhena.produktetMeShituaraSot[0]?.emri || '—'}
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-proit-muted text-sm">Stok i Ulet</span>
            <AlertTriangle size={18} className="text-orange-400" />
          </div>
          <p className="text-2xl font-bold text-white">{te_dhena.stokUlet.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* GRAFIKU */}
        <div className="card col-span-2">
          <h2 className="font-semibold text-white mb-4">Shitjet — 7 Ditet e Fundit</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={grafikuData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2b2f2b" />
              <XAxis dataKey="data" stroke="#8a8f8a" fontSize={12} />
              <YAxis stroke="#8a8f8a" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e221e', border: '1px solid #2b2f2b', borderRadius: 8 }}
                labelStyle={{ color: '#fff' }}
                formatter={(v) => [`${v} €`, 'Totali']}
              />
              <Line type="monotone" dataKey="totali" stroke="#a6e635" strokeWidth={2} dot={{ fill: '#a6e635' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* PRODUKTET ME TE SHITURA */}
        <div className="card">
          <h2 className="font-semibold text-white mb-4">Me te Shitura Sot</h2>
          <div className="space-y-3">
            {te_dhena.produktetMeShituaraSot.length === 0 ? (
              <p className="text-proit-muted text-sm">Asnje shitje akoma sot.</p>
            ) : (
              te_dhena.produktetMeShituaraSot.map((p, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-white">{p.emri}</span>
                  <span className="text-sm text-proit-lime font-semibold">{p.sasia}x</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ALARM STOKU */}
      {te_dhena.stokUlet.length > 0 && (
        <div className="card mt-6 border-orange-800">
          <h2 className="font-semibold text-orange-400 mb-3 flex items-center gap-2">
            <AlertTriangle size={18} />
            Produkte me Stok te Ulet
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {te_dhena.stokUlet.map((p) => (
              <div key={p.id} className="bg-proit-dark rounded-lg px-3 py-2 flex justify-between items-center">
                <span className="text-sm text-white">{p.emri}</span>
                <span className="text-sm text-orange-400 font-semibold">{Number(p.sasiaStok)} {p.njesia}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
