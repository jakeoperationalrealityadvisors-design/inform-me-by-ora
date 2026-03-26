import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Users, ClipboardList, MessageSquare,
    BarChart3, Settings, ChevronLeft, ChevronRight, LogOut, Menu, X
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ThemeToggle from '../theme/ThemeToggle';

const NAV = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { label: 'Users', icon: Users, path: '/AdminUsers' },
    { label: 'Tasks', icon: ClipboardList, path: '/AdminTasks' },
    { label: 'Messages', icon: MessageSquare, path: '/AdminMessages' },
    { label: 'Reports', icon: BarChart3, path: '/AdminReports' },
    { label: 'Settings', icon: Settings, path: '/AdminSettings' },
];

export default function AdminLayout({ children, currentPageName, user }) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    const handleLogout = () => base44.auth.logout('/');

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-700 ${collapsed ? 'justify-center' : ''}`}>
                <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-black text-sm">O</span>
                </div>
                {!collapsed && (
                    <div>
                        <p className="text-white font-bold text-sm leading-tight">Inform' Me</p>
                        <p className="text-orange-400 text-xs">by ORA · Admin</p>
                    </div>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
                {NAV.map(({ label, icon: Icon, path }) => {
                    const active = location.pathname === path;
                    return (
                        <Link
                            key={path}
                            to={path}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                                active
                                    ? 'bg-orange-500 text-white'
                                    : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                            }`}
                        >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            {!collapsed && <span className="text-sm font-medium">{label}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className={`border-t border-slate-700 p-3 space-y-2 ${collapsed ? 'flex flex-col items-center' : ''}`}>
                <ThemeToggle showLabel={!collapsed} />
                <div className={`flex items-center gap-2 ${collapsed ? 'flex-col' : ''}`}>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-white text-xs font-medium truncate">{user?.full_name || 'Admin'}</p>
                            <p className="text-slate-400 text-xs truncate">{user?.email}</p>
                        </div>
                    )}
                    <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-700 transition-colors">
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex bg-slate-900">
            {/* Desktop Sidebar */}
            <aside className={`hidden sm:flex flex-col flex-shrink-0 bg-slate-800 border-r border-slate-700 transition-all duration-200 ${collapsed ? 'w-16' : 'w-56'}`}>
                <SidebarContent />
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 translate-x-full bg-slate-700 hover:bg-slate-600 text-slate-300 p-1 rounded-r-lg transition-colors"
                    style={{ left: collapsed ? '3.5rem' : '13.5rem' }}
                >
                    {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
                </button>
            </aside>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-40 sm:hidden">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
                    <aside className="absolute left-0 top-0 h-full w-64 bg-slate-800 z-50">
                        <SidebarContent />
                    </aside>
                </div>
            )}

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile topbar */}
                <header className="sm:hidden flex items-center gap-3 px-4 py-3 bg-slate-800 border-b border-slate-700">
                    <button onClick={() => setMobileOpen(true)} className="text-slate-400 hover:text-white">
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-orange-500 flex items-center justify-center">
                            <span className="text-white font-black text-xs">O</span>
                        </div>
                        <span className="text-white font-bold text-sm">Inform' Me · Admin</span>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}