import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ClipboardCheck, MessageSquare, Scan, Settings, LogOut, Menu } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function UserLayout({ children }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
    staleTime: 60000
  });

  const { data: orgMember } = useQuery({
    queryKey: ['org-member', user?.email],
    queryFn: () => base44.entities.OrganizationMember.filter({ user_email: user.email }).then(r => r[0]),
    enabled: !!user?.email
  });

  const { data: org } = useQuery({
    queryKey: ['user-org', orgMember?.organization_id],
    queryFn: () => base44.entities.Organization.filter({ id: orgMember.organization_id }).then(r => r[0] ?? null),
    enabled: !!orgMember?.organization_id
  });

  const features = org?.settings || {};
  const scannerEnabled = features.scanner_enabled !== false;
  const messagingEnabled = features.messaging_enabled !== false;
  const reportsEnabled = features.reports_enabled !== false;

  const navItems = [
    { label: 'Home', icon: Home, path: '/UserDashboard' },
    { label: 'My Tasks', icon: ClipboardCheck, path: '/MyTasks' },
    ...(reportsEnabled ? [{ label: 'Reports', icon: ClipboardCheck, path: '/Submissions' }] : []),
    ...(messagingEnabled ? [{ label: 'Messages', icon: MessageSquare, path: '/Messages' }] : []),
    ...(scannerEnabled ? [{ label: 'Scanner', icon: Scan, path: '/Scanner' }] : []),
    { label: 'Settings', icon: Settings, path: '/Settings' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col">
      {/* Top Bar */}
      <header className="bg-[#0d1320] border-b border-blue-900/20 sticky top-0 z-30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs">i</div>
          <span className="font-bold text-white">InformMe</span>
          {org && <span className="text-xs text-blue-400 ml-2">· {org.name}</span>}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">{user?.full_name || user?.email}</span>
          <button
            onClick={() => base44.auth.logout()}
            className="text-slate-500 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0d1320] border-t border-blue-900/20 z-30">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map(({ label, icon: Icon, path }) => (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all min-w-0 ${
                isActive(path)
                  ? 'text-orange-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium truncate">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}