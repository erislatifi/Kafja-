import { useAuth } from '../../context/AuthContext';

const menu = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'products', label: 'Produktet / Pijet', icon: '📦' },
  { id: 'stock', label: 'Stoku', icon: '🗃️' },
  { id: 'orders', label: 'Porosite', icon: '🧾' },
  { id: 'reports', label: 'Raportet', icon: '📈' },
  { id: 'users', label: 'Punonjesit & PIN', icon: '👥' },
  { id: 'settings', label: 'Cilesimet', icon: '⚙️' },
];

export default function AdminLayout({ children, faqjaAktive, onNdryshoFaqjen, onLogout }) {
  const { user, theme, toggleTheme } = useAuth();

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)' }}>
      {/* SIDEBAR */}
      <div style={{ width: 210, background: 'var(--bg2)', borderRight: '1px solid var(--bd)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: 14, borderBottom: '1px solid var(--bd)', display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 34, height: 34, background: 'var(--lm)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: 'var(--ld)', fontSize: 16 }}>P</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx)' }}>PRO IT</div>
            <div style={{ fontSize: 10, color: 'var(--mt)' }}>Kafe Nlagje</div>
          </div>
        </div>

        <div style={{ flex: 1, padding: 8, display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {menu.map(m => (
            <div key={m.id} onClick={() => onNdryshoFaqjen(m.id)} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
              borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 500,
              background: faqjaAktive === m.id ? 'var(--lm)' : 'transparent',
              color: faqjaAktive === m.id ? 'var(--ld)' : 'var(--mt)',
              transition: 'all 0.12s'
            }}
            onMouseEnter={e => { if (faqjaAktive !== m.id) { e.currentTarget.style.background = 'var(--bg3)'; e.currentTarget.style.color = 'var(--tx)'; }}}
            onMouseLeave={e => { if (faqjaAktive !== m.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--mt)'; }}}
            >
              <span>{m.icon}</span> {m.label}
            </div>
          ))}
        </div>

        <div style={{ padding: 8, borderTop: '1px solid var(--bd)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx)', padding: '4px 10px 1px' }}>{user?.emri}</div>
          <div style={{ fontSize: 10, color: 'var(--lm)', padding: '0 10px 6px' }}>Administrator</div>
          <div onClick={toggleTheme} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 11, color: 'var(--mt)' }}>
            {theme === 'dark' ? '☀️' : '🌙'} {theme === 'dark' ? 'Tema e Bardhe' : 'Tema e Zeze'}
          </div>
          <div onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 12, color: 'var(--mt)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; e.currentTarget.style.color = 'var(--rd)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--mt)'; }}>
            🚪 Dil nga Llogaria
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ flex: 1, padding: 16, overflowY: 'auto' }}>{children}</div>
        <div style={{ borderTop: '1px solid var(--bd)', padding: 6, textAlign: 'center', fontSize: 10, color: 'var(--mt)' }}>
          Powered by <span style={{ color: 'var(--lm)', fontWeight: 600 }}>PRO IT</span> | prs-ks.com
        </div>
      </div>
    </div>
  );
}
