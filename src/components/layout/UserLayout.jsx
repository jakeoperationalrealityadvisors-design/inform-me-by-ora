import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ClipboardList, Camera, MessageSquare, User } from 'lucide-react';

const NAV = [
    { label: 'Home', icon: Home, path: '/UserHome' },
    { label: 'Tasks', icon: ClipboardList, path: '/UserTasks' },
    { label: 'Scan', icon: Camera, path: '/UserScan' },
    { label: 'Messages', icon: MessageSquare, path: '/UserMessages' },
    { label: 'Profile', icon: User, path: '/UserProfile' },
];

export default function UserLayout({ children, user }) {
    const location = useLocation();

    return (
        <div className="min-h-screen flex flex-col bg-slate-900">
            {/* Mobile topbar */}
            <header className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center">
                        <span className="text-white font-black text-xs">O</span>
                    </div>
                    <span className="text-white font-bold text-sm">Inform' Me</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-xs">{user?.full_name || 'User'}</span>
                    <div className="w-7 h-7 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center">
                        <span className="text-orange-400 font-bold text-xs">
                            {(user?.full_name || 'U')[0].toUpperCase()}
                        </span>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto pb-20 sm:pb-0">
                <div className="max-w-2xl mx-auto sm:max-w-full">
                    {/* Desktop side nav */}
                    <div className="hidden sm:flex">
                        <aside className="w-48 min-h-screen bg-slate-800 border-r border-slate-700 flex-shrink-0">
                            <nav className="py-4 px-2 space-y-1">
                                {NAV.map(({ label, icon: Icon, path }) => {
                                    const active = location.pathname === path;
                                    return (
                                        <Link
                                            key={path}
                                            to={path}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                                                active
                                                    ? 'bg-orange-500 text-white'
                                                    : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                                            }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span className="text-sm font-medium">{label}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </aside>
                        <div className="flex-1 p-6">{children}</div>
                    </div>
                    {/* Mobile only content */}
                    <div className="sm:hidden p-4">{children}</div>
                </div>
            </main>

            {/* Mobile bottom nav */}
            <nav className="sm:hidden fixed bottom-0 inset-x-0 bg-slate-800 border-t border-slate-700 z-30">
                <div className="flex items-center justify-around py-2">
                    {NAV.map(({ label, icon: Icon, path }) => {
                        const active = location.pathname === path;
                        return (
                            <Link
                                key={path}
                                to={path}
                                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                                    active ? 'text-orange-500' : 'text-slate-500'
                                }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="text-[10px] font-medium">{label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}