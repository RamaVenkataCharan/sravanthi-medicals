import { useState } from 'react';
import {
  LayoutDashboard, ShoppingCart, Package, History,
  Users, Stethoscope, BarChart2, AlertTriangle,
  Menu, X, Pill, ChevronRight,
} from 'lucide-react';
import { STORE_INFO, NAV_ITEMS, PageId } from '../lib/constants';

const iconMap = {
  LayoutDashboard,
  ShoppingCart,
  Package,
  History,
  Users,
  Stethoscope,
  BarChart2,
  AlertTriangle,
};

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: PageId) => void;
}

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentNav = NAV_ITEMS.find((n) => n.id === currentPage);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* ── Mobile Overlay ───────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          w-[260px] bg-[#0f172a] text-white
          transition-transform duration-300 ease-out
          lg:translate-x-0 lg:static lg:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo / Store Name */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 h-9 w-9 bg-green-500/20 rounded-xl flex items-center justify-center">
              <Pill className="h-5 w-5 text-green-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white leading-tight truncate">
                Sravanthi
              </p>
              <p className="text-xs text-slate-400 leading-tight">Medical Stores</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-lg hover:bg-white/10 transition-colors text-slate-400"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto sidebar-scroll px-3 py-4">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const Icon = iconMap[item.icon as keyof typeof iconMap];
              const isActive = currentPage === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onNavigate(item.id as PageId);
                      setSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                      transition-all duration-150 group relative
                      ${isActive
                        ? 'bg-green-500/15 text-green-400 nav-item-active'
                        : 'text-slate-400 hover:bg-white/6 hover:text-slate-100'
                      }
                    `}
                  >
                    <Icon className={`h-4.5 w-4.5 flex-shrink-0 h-5 w-5 ${isActive ? 'text-green-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {isActive && <ChevronRight className="h-3.5 w-3.5 text-green-400 opacity-70" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Store Info Footer */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="bg-white/5 rounded-xl px-3 py-3">
            <p className="text-xs font-semibold text-slate-300 mb-1">{STORE_INFO.name}</p>
            <p className="text-xs text-slate-500 leading-relaxed">{STORE_INFO.fullAddress}</p>
            <div className="mt-2 pt-2 border-t border-white/10">
              <p className="text-xs text-slate-600">{STORE_INFO.licenses.form20}</p>
              <p className="text-xs text-slate-600">{STORE_INFO.licenses.form21}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="flex-shrink-0 h-16 bg-white border-b border-slate-200 flex items-center px-6 gap-4 shadow-sm">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Page Title */}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-slate-900 truncate">
              {currentNav?.label || 'Dashboard'}
            </h1>
          </div>

          {/* Right: Date */}
          <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
            <span>
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-screen-2xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
