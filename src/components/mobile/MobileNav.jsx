import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, ClipboardList, ListTodo, FolderOpen, MoreHorizontal, BarChart3, Settings, Scan, MessageSquare, TrendingUp, Users, Zap, Shield, ChevronRight, Eye, Sparkles, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

// Map any page to its "parent" nav item for active-state syncing
const PAGE_TO_NAV = {
    // Home
    Home: 'Home',
    Dashboard: 'Home',
    AIAssistantPage: 'Home',
    AIAssistantTest: 'Home',
    // Submissions / Forms
    Submissions: 'Submissions',
    FillForm: 'Submissions',
    FillChecklist: 'Submissions',
    ViewFormSubmission: 'Submissions',
    ViewChecklistSubmission: 'Submissions',
    PublicForm: 'Submissions',
    PublicChecklist: 'Submissions',
    // Tasks
    MyTasks: 'MyTasks',
    CreateTask: 'MyTasks',
    // Docs
    Documents: 'Documents',
    UploadDocument: 'Documents',
    ViewDocument: 'Documents',
    DocumentEditor: 'Documents',
    ManageFolders: 'Documents',
    DocumentSearch: 'Documents',
    // More group
    Reports: 'Reports',
    Messages: 'Messages',
    Scanner: 'Scanner',
    Settings: 'Settings',
    OversightDashboard: 'OversightDashboard',
};

const MORE_PAGES = new Set(['Reports', 'Messages', 'Scanner', 'Settings',
    'ManageAutomations', 'EditAutomation', 'ActivityLog', 'RoleManagement',
    'UserManagement', 'OrganizationSettings', 'Integrations', 'Support']);

export default function MobileNav() {
    const location = useLocation();

    const currentPage = location.pathname.split('/').pop() || 'Home';
    const activeNav = PAGE_TO_NAV[currentPage] || currentPage;
    const isActive = (path) => activeNav === path;
    const isMoreActive = MORE_PAGES.has(activeNav);

    const navItems = [
        { name: 'Home',   icon: Home,          path: 'Home' },
        { name: 'Forms',  icon: ClipboardList, path: 'Submissions' },
        { name: 'Tasks',  icon: ListTodo,       path: 'MyTasks' },
        { name: 'Docs',   icon: FolderOpen,     path: 'Documents' },
    ];

    const [sidebarExpanded, setSidebarExpanded] = useState(() => {
        return localStorage.getItem('sidebarExpanded') !== 'false';
    });

    const toggleSidebar = () => {
        setSidebarExpanded(v => {
            const next = !v;
            localStorage.setItem('sidebarExpanded', String(next));
            document.documentElement.style.setProperty('--sidebar-w', next ? '224px' : '64px');
            return next;
        });
    };

    // Set CSS var on mount
    React.useEffect(() => {
        document.documentElement.style.setProperty('--sidebar-w', sidebarExpanded ? '224px' : '64px');
    }, []);

    const sidebarItems = [
        { label: 'Home',        icon: Home,          path: 'Home' },
        { label: 'Submissions', icon: ClipboardList, path: 'Submissions' },
        { label: 'Tasks',       icon: ListTodo,      path: 'MyTasks' },
        { label: 'Documents',   icon: FolderOpen,    path: 'Documents' },
        { label: 'Reports',     icon: BarChart3,     path: 'Reports' },
        { label: 'Analytics',   icon: TrendingUp,    path: 'AnalyticsDashboard' },
        { label: 'Messages',    icon: MessageSquare, path: 'Messages' },
        { label: 'Automations', icon: Zap,           path: 'ManageAutomations' },
        { label: 'AI Assistant',icon: Sparkles,      path: 'AIAssistantPage' },
    ];

    const adminItems = [
        { label: 'Oversight',   icon: Eye,           path: 'OversightDashboard' },
        { label: 'Users',       icon: Users,         path: 'UserManagement' },
        { label: 'Billing',     icon: CreditCard,    path: 'AdminBilling' },
    ];

    return (
        <>
            {/* ── MOBILE BOTTOM NAV ── */}
            <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0d1120] border-t border-white/5 pb-safe">
                <div className="flex items-center justify-around h-16 px-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.name}
                                to={createPageUrl(item.path)}
                                className="flex-1 flex flex-col items-center justify-center relative py-2"
                            >
                                {active && (
                                    <motion.div
                                        layoutId="mobileActiveTab"
                                        className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-orange-500 rounded-full"
                                    />
                                )}
                                <Icon className={`w-5 h-5 mb-1 transition-colors ${active ? 'text-orange-500' : 'text-white/35'}`} />
                                <span className={`text-[10px] font-medium transition-colors ${active ? 'text-orange-500' : 'text-white/35'}`}>
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}

                    {/* More dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex-1 flex flex-col items-center justify-center relative py-2">
                            {isMoreActive && (
                                <motion.div
                                    layoutId="mobileActiveTab"
                                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-orange-500 rounded-full"
                                />
                            )}
                            <MoreHorizontal className={`w-5 h-5 mb-1 transition-colors ${isMoreActive ? 'text-orange-500' : 'text-white/35'}`} />
                            <span className={`text-[10px] font-medium transition-colors ${isMoreActive ? 'text-orange-500' : 'text-white/35'}`}>More</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" side="top" className="w-52 bg-[#131927] border-white/10 text-white mb-2">
                            <DropdownMenuItem asChild>
                                <Link to={createPageUrl('Scanner')} className="flex items-center gap-2 text-white hover:bg-white/5 cursor-pointer">
                                    <Scan className="w-4 h-4 text-orange-400" /> Scanner
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link to={createPageUrl('Messages')} className="flex items-center gap-2 text-white hover:bg-white/5 cursor-pointer">
                                    <MessageSquare className="w-4 h-4 text-purple-400" /> Messages
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link to={createPageUrl('Reports')} className="flex items-center gap-2 text-white hover:bg-white/5 cursor-pointer">
                                    <BarChart3 className="w-4 h-4 text-emerald-400" /> Reports
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem asChild>
                                <Link to={createPageUrl('Settings')} className="flex items-center gap-2 text-white hover:bg-white/5 cursor-pointer">
                                    <Settings className="w-4 h-4 text-white/50" /> Settings
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </nav>

            {/* ── DESKTOP SIDEBAR ── */}
            <aside
                className={`hidden sm:flex fixed top-0 left-0 bottom-0 z-40 flex-col bg-[#080c14] border-r border-white/5 transition-all duration-200 ${sidebarExpanded ? 'w-56' : 'w-16'}`}
            >
                {/* Logo */}
                <div className={`flex items-center h-14 px-4 border-b border-white/5 ${sidebarExpanded ? 'gap-2.5' : 'justify-center'}`}>
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-blue-700 flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-bold">I</span>
                    </div>
                    {sidebarExpanded && <span className="text-white font-bold text-sm tracking-tight">InForm Me</span>}
                </div>

                {/* Main nav */}
                <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
                    {sidebarItems.map(({ label, icon: Icon, path }) => {
                        const active = activeNav === path;
                        return (
                            <Link
                                key={path}
                                to={createPageUrl(path)}
                                title={!sidebarExpanded ? label : undefined}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors group relative ${
                                    active
                                        ? 'bg-orange-500/15 text-orange-400'
                                        : 'text-white/45 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <Icon className="w-4.5 h-4.5 shrink-0" size={18} />
                                {sidebarExpanded && <span className="truncate">{label}</span>}
                                {active && sidebarExpanded && (
                                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500" />
                                )}
                            </Link>
                        );
                    })}

                    {/* Admin section */}
                    <div className={`pt-3 mt-2 border-t border-white/5 space-y-0.5`}>
                        {sidebarExpanded && (
                            <p className="px-3 pb-1 text-[10px] uppercase tracking-widest text-white/20 font-semibold">Admin</p>
                        )}
                        {adminItems.map(({ label, icon: Icon, path }) => {
                            const active = activeNav === path;
                            return (
                                <Link
                                    key={path}
                                    to={createPageUrl(path)}
                                    title={!sidebarExpanded ? label : undefined}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                        active
                                            ? 'bg-orange-500/15 text-orange-400'
                                            : 'text-white/35 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <Icon size={18} className="shrink-0" />
                                    {sidebarExpanded && <span className="truncate">{label}</span>}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Bottom: settings + collapse toggle */}
                <div className="p-2 border-t border-white/5 space-y-0.5">
                    <Link
                        to={createPageUrl('Settings')}
                        title={!sidebarExpanded ? 'Settings' : undefined}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                            activeNav === 'Settings'
                                ? 'bg-orange-500/15 text-orange-400'
                                : 'text-white/35 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <Settings size={18} className="shrink-0" />
                        {sidebarExpanded && <span>Settings</span>}
                    </Link>
                    <button
                        onClick={toggleSidebar}
                        className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-white/25 hover:text-white/60 hover:bg-white/5 transition-colors"
                    >
                        <ChevronRight size={18} className={`shrink-0 transition-transform ${sidebarExpanded ? 'rotate-180' : ''}`} />
                        {sidebarExpanded && <span className="text-sm">Collapse</span>}
                    </button>
                </div>
            </aside>
        </>
    );
}