import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, ClipboardList, CheckSquare, ListTodo, FolderOpen, MoreHorizontal, BarChart3, Settings, Scan, MessageSquare } from 'lucide-react';
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

            {/* ── DESKTOP TOP NAV BAR ── */}
            <nav className="hidden sm:flex fixed top-0 left-0 right-0 z-40 bg-[#0d1120]/95 backdrop-blur border-b border-white/5 px-6 h-12 items-center gap-1">
                <div className="flex items-center gap-1 mr-6">
                    <div className="w-6 h-6 rounded-md bg-gradient-to-br from-orange-500 to-blue-700 flex items-center justify-center mr-1.5">
                        <span className="text-white text-xs font-bold">I</span>
                    </div>
                    <span className="text-white font-bold text-sm">InForm Me</span>
                </div>
                {[
                    { label: 'Home', path: 'Home' },
                    { label: 'Submissions', path: 'Submissions' },
                    { label: 'Tasks', path: 'MyTasks' },
                    { label: 'Documents', path: 'Documents' },
                    { label: 'Reports', path: 'Reports' },
                    { label: 'Messages', path: 'Messages' },
                ].map(item => {
                    const active = isActive(item.path);
                    return (
                        <Link
                            key={item.path}
                            to={createPageUrl(item.path)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                active ? 'bg-orange-500/15 text-orange-400' : 'text-white/50 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {item.label}
                        </Link>
                    );
                })}
                <div className="ml-auto flex items-center gap-2">
                    <Link to={createPageUrl('Settings')} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors">
                        <Settings className="w-4 h-4" />
                    </Link>
                </div>
            </nav>
        </>
    );
}