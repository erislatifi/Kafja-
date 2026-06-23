// ============================================================
// MAIN LAYOUT - Sidebar + Header + Footer (Powered by PRO IT)
// ============================================================
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Boxes,
  FileBarChart,
  Users,
  Settings,
  LogOut,
  Coffee,
} from 'lucide-react';

const linket = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, rolet: null },
  { to: '/pos', label: 'Porosi e Re', icon: ShoppingCart, rolet: null },
  { to: '/porosite', label: 'Porosite', icon: Coffee, rolet: null },
  { to: '/produktet', label: 'Produktet', icon: Package, rolet: ['ADMIN', 'MENAXHER'] },
  { to: '/stoku', label: 'Stoku', icon: Boxes, rolet: ['ADMIN', 'MENAXHER'] },
  { to: '/raportet', label: 'Raportet', icon: FileBarChart, rolet: ['ADMIN', 'MENAXHER'] },
  { to: '/perdoruesit', label: 'Perdoruesit', icon: Users, rolet: ['ADMIN'] },
  { to: '/cilesimet', label: 'Cilesimet', icon: Settings, rolet: ['ADMIN', 'MENAXHER'] },
];

const roliEmer = {
  ADMIN: 'Administrator',
  MENAXHER: 'Menaxher',
  ARKATAR: 'Arkatar',
  KAMERIER: 'Kamerier',
};

export default function MainLayout({ children }) {
  const { user, logout, kaRol } = useAuth();
  const navigate = useNavigate();

  function dilNgaLlogaria() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen flex bg-proit-black">
      {/* SIDEBAR */}
      <aside className="w-64 bg-proit-dark border-r border-proit-border flex flex-col fixed h-screen">
        <div className="p-5 border-b border-proit-border">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-proit-lime flex items-center justify-center font-extrabold text-proit-black text-lg">
              P
            </div>
            <div>
              <p className="font-bold text-white leading-tight">PRO IT</p>
              <p className="text-xs text-proit-muted leading-tight">Kafe Nlagje</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {linket
            .filter((l) => !l.rolet || kaRol(...l.rolet))
            .map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-proit-lime text-proit-black'
                      : 'text-proit-muted hover:bg-proit-panel hover:text-white'
                  }`
                }
              >
                <l.icon size={18} />
                {l.label}
              </NavLink>
            ))}
        </nav>

        <div className="p-3 border-t border-proit-border">
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-semibold text-white truncate">{user?.emri}</p>
            <p className="text-xs text-proit-lime">{roliEmer[user?.role] || user?.role}</p>
          </div>
          <button
            onClick={dilNgaLlogaria}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-proit-muted hover:bg-red-900/20 hover:text-red-400 transition-colors"
          >
            <LogOut size={18} />
            Dil nga Llogaria
          </button>
        </div>
      </aside>

      {/* CONTENT */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <main className="flex-1 p-6">{children}</main>

        <footer className="border-t border-proit-border px-6 py-3 text-center">
          <p className="text-xs text-proit-muted">
            Powered by <span className="text-proit-lime font-semibold">PRO IT</span> | prs-ks.com
          </p>
        </footer>
      </div>
    </div>
  );
}
