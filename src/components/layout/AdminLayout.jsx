import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Zap, ClipboardList, BarChart2, 
  MessageSquare, Settings, Wand2, CreditCard, ChevronLeft,
  ChevronRight, Building2, LogOut, Menu, X, QrCode
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, path: '/AdminOverview' },
  { label: 'Users', icon: Users, path: '/UserManagement' },
  { label: 'Hop Codes', icon: QrCode, path: '/HopCodes' },
  { label: 'Push / Assign', icon: Zap, path: '/PushCenter' },
  { label: 'Forms & Checklists', icon: ClipboardList, path: '/CreateForm' },
  { label: 'Reports', icon: BarChart2, path: '/Reports' },
  { label: 'Messages', icon: MessageSquare, path: '/Messages' },
  { label: 'Organization', icon: Building2, path: '/OrganizationSettings' },
  { label: 'Setup Wizard', icon: Wand2, path: '/SetupWizard' },
  { label: 'Billing', icon: CreditCard, path: '/AdminBilling' },
];

export default function AdminLayout({ children }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-5 border-b border-blue-900/30">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          i
        </div>
        {!collapsed && <span className="font-bold text-white text-lg tracking-tight">InformMe</span>}
      </div>

      {!collapsed && (
        <div className="px-4 py-2 mt-1">
          <span className="text-xs font-semibold text-orange-400 uppercase tracking-widest">Admin Console</span>
        </div>
      )}

      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, icon: Icon, path }) => (
          <Link
            key={path}
            to={path}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
              isActive(path)
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}
      </nav>

      <div className="px-2 py-3 border-t border-blue-900/30 space-y-1">
        <button
          onClick={() => base44.auth.logout()}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/30 w-full text-sm transition-all"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  const sidebarW = collapsed ? 64 : 224;

  return (
    <div className="min-h-screen bg-[#070b14] flex">
      {/* Desktop Sidebar */}
      <aside
        style={{ width: sidebarW }}
        className="hidden sm:flex flex-col fixed top-0 left-0 h-full bg-[#0d1320] border-r border-blue-900/20 z-40 transition-all duration-200"
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-[#0d1320] border border-blue-900/30 rounded-full flex items-center justify-center text-blue-400 hover:text-white"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="sm:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-[#0d1320] border-r border-blue-900/20 flex flex-col">
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <main
        style={{ marginLeft: typeof window !== 'undefined' && window.innerWidth >= 640 ? sidebarW : 0 }}
        className="flex-1 min-h-screen flex flex-col"
      >
        {/* Mobile top bar */}
        <div className="sm:hidden flex items-center gap-3 px-4 py-3 bg-[#0d1320] border-b border-blue-900/20 sticky top-0 z-30">
          <button onClick={() => setMobileOpen(true)} className="text-slate-400">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-white">InformMe</span>
          <span className="ml-auto text-xs text-orange-400 font-semibold uppercase">Admin</span>
        </div>

        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}