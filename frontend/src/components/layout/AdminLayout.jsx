import { useAuth } from '../../context/AuthContext';

const menu = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'products', label: 'Produktet / Pijet', icon: '📦' },
  { id: 'stock', label: 'Stoku', icon: '🗃️' },
  { id: 'orders', label: 'Porosite', icon: '🧾' },
  { id: 'reports', label: 'Raportet', icon: '📈' },
  { id: 'tables', label: 'Tavolinat', icon: '🪑' },
  { id: 'users', label: 'Punonjesit & PIN', icon: '👥' },
  { id: 'settings', label: 'Cilesimet', icon: '⚙️' },
];

export default function AdminLayout({ children, faqjaAktive, onNdryshoFaqjen, onLogout }) {
  const { user, theme, toggleTheme } = useAuth();

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)', overflow: 'hidden' }}>
      <div className="sidebar" style={{ width: 200, display: 'flex', flexDirection: 'column', flexShrink: 0, height: '100vh' }}>
        <div style={{ padding: '14px 14px 12px', borderBottom: '1.5px solid var(--bd)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo-p.png" alt="P" style={{ width: 32, height: 32, objectFit: 'contain' }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--tx)' }}>PRO IT</div>
            <div style={{ fontSize: 10, color: 'var(--mt)' }}>Kafe Nlagje</div>
          </div>
        </div>

        <div style={{ flex: 1, padding: '8px 6px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {menu.map(m => (
            <div key={m.id} onClick={() => onNdryshoFaqjen(m.id)}
              className={`nav-item${faqjaAktive === m.id ? ' aktiv' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', cursor: 'pointer', fontSize: 12, fontWeight: 500, transition: 'all 0.12s' }}>
              <span style={{ fontSize: 15 }}>{m.icon}</span>
              {m.label}
            </div>
          ))}
        </div>

        <div style={{ padding: '8px 6px', borderTop: '1.5px solid var(--bd)' }}>
          <div style={{ padding: '4px 10px 2px', fontSize: 12, fontWeight: 700, color: 'var(--tx)' }}>{user?.emri}</div>
          <div style={{ padding: '0 10px 8px', fontSize: 10, color: 'var(--lm)', fontWeight: 600 }}>Administrator</div>
          <div onClick={toggleTheme} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 10px', borderRadius: 7, cursor: 'pointer', fontSize: 11, color: 'var(--mt)' }}>
            {theme === 'dark' ? '☀️ Tema e Bardhë' : '🌙 Tema e Zezë'}
          </div>
          <div onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 10px', borderRadius: 7, cursor: 'pointer', fontSize: 12, color: 'var(--rd)' }}>
            🚪 Dil
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>{children}</div>
        <div style={{ borderTop: '1.5px solid var(--bd)', padding: '6px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--bg2)' }}>
          <img src="/logo-proit.png" alt="PRO IT" style={{ height: 18, objectFit: 'contain', opacity: 0.6 }} />
          <span style={{ fontSize: 10, color: 'var(--mt)' }}>prs-ks.com</span>
        </div>
      </div>
    </div>
  );
}
