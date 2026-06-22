import { useState, useEffect } from 'react';
import api from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [td, setTd] = useState(null);
  const [duke_ngarkuar, setDukeNgarkuar] = useState(true);

  useEffect(() => {
    api.get('/reports/dashboard').then(r => setTd(r.data)).catch(() => {}).finally(() => setDukeNgarkuar(false));
  }, []);

  if (duke_ngarkuar) return <div style={{ color: 'var(--mt)', padding: 20 }}>Duke u ngarkuar...</div>;
  if (!td) return <div style={{ color: 'var(--mt)' }}>Nuk u ngarkuan te dhenat.</div>;

  const grafikuData = Object.entries(td.grafiku7Dite || {}).map(([data, totali]) => ({
    data: new Date(data).toLocaleDateString('sq-AL', { day: '2-digit', month: '2-digit' }),
    totali: Math.round(totali * 100) / 100,
  }));

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--tx)', marginBottom: 18 }}>Dashboard</div>

      {/* KARTAT KRYESORE */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 18 }}>
        {[
          { label: 'Shitjet e Sotme', vlera: `${td.totaliSot?.toFixed(2)} €`, ngjyra: 'lime' },
          { label: 'Numri i Porosive', vlera: td.numriPorosiveSot, ngjyra: '' },
          { label: 'Produkti Kryesor', vlera: td.produktetMeShituaraSot?.[0]?.emri || '—', ngjyra: '', i_vogel: true },
          { label: 'Stok i Ulet', vlera: td.stokUlet?.length || 0, ngjyra: 'orange' },
        ].map((k, i) => (
          <div key={i} className="stat-kard">
            <div className="label">{k.label}</div>
            <div className={`vlera ${k.ngjyra}`} style={k.i_vogel ? { fontSize: 15 } : {}}>{k.vlera}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        {/* GRAFIKU */}
        <div className="kard">
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx)', marginBottom: 14 }}>Shitjet — 7 Ditet e Fundit</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={grafikuData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bd)" />
              <XAxis dataKey="data" stroke="var(--mt)" fontSize={11} />
              <YAxis stroke="var(--mt)" fontSize={11} />
              <Tooltip
                contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--bd)', borderRadius: 8, color: 'var(--tx)' }}
                formatter={v => [`${v} €`, 'Totali']}
              />
              <Line type="monotone" dataKey="totali" stroke="var(--lm)" strokeWidth={2.5} dot={{ fill: 'var(--lm)', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ME TE SHITURA */}
        <div className="kard">
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx)', marginBottom: 12 }}>Me te Shitura Sot</div>
          {td.produktetMeShituaraSot?.length === 0 ? (
            <div style={{ color: 'var(--mt)', fontSize: 12 }}>Asnje shitje akoma sot.</div>
          ) : td.produktetMeShituaraSot?.map((p, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--bd)', fontSize: 13 }}>
              <span style={{ color: 'var(--tx)' }}>{p.emri}</span>
              <span style={{ color: 'var(--lm)', fontWeight: 700 }}>{p.sasia}x</span>
            </div>
          ))}
        </div>
      </div>

      {/* ALARME STOKU */}
      {td.stokUlet?.length > 0 && (
        <div className="kard" style={{ borderColor: 'rgba(234,88,12,0.3)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--or)', marginBottom: 10 }}>⚠️ Produkte me Stok te Ulet</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {td.stokUlet.map(p => (
              <div key={p.id} style={{ background: 'var(--bg3)', borderRadius: 8, padding: '8px 12px', display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--tx)' }}>{p.emri}</span>
                <span style={{ color: 'var(--or)', fontWeight: 700 }}>{Number(p.sasiaStok)} {p.njesia}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
