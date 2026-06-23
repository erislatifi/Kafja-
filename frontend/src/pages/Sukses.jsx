import { useEffect, useState } from 'react';

export default function Sukses({ totali, tavolina, perdoruesi, metoda, onKthet }) {
  const [progres, setProgres] = useState(100);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgres(prev => {
        if (prev <= 0) { clearInterval(interval); onKthet(); return 0; }
        return prev - 2.5;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const sekonda = Math.ceil(progres / 25);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
      <div style={{ width: 80, height: 80, background: 'rgba(166,230,53,0.12)', border: '2px solid var(--lm)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 32 }}>✓</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--lm)', marginBottom: 6 }}>Pagesa u Krye!</div>
      <div style={{ fontSize: 13, color: 'var(--mt)', marginBottom: 24 }}>Tavolina {tavolina} u lirua me sukses</div>

      <div style={{ background: 'var(--bg3)', border: '1px solid var(--bd)', borderRadius: 12, padding: '14px 24px', marginBottom: 20, minWidth: 230 }}>
        {[['Tavolina', tavolina], ['Totali', `${Number(totali).toFixed(2)} €`], ['Pagesa', metoda === 'cash' ? 'Cash 💵' : 'Kartele 💳'], ['Kamerieri', perdoruesi]].map(([l, v]) => (
          <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '3px 0' }}>
            <span style={{ color: 'var(--mt)' }}>{l}</span>
            <span style={{ color: l === 'Totali' ? 'var(--lm)' : 'var(--tx)', fontWeight: 600 }}>{v}</span>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, color: 'var(--mt)', marginBottom: 6 }}>
        Duke u kthyer tek PIN-i pas {sekonda} sekond{sekonda === 1 ? 'e' : 'a'}...
      </div>
      <div style={{ width: 190, height: 4, background: 'var(--bd)', borderRadius: 2 }}>
        <div style={{ width: `${progres}%`, height: '100%', background: 'var(--lm)', borderRadius: 2, transition: 'width 0.1s linear' }} />
      </div>
    </div>
  );
}
