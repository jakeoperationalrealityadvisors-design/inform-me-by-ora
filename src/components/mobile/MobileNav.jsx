import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, ClipboardList, CheckSquare, ListTodo, FolderOpen, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import OrgSwitcher from '@/components/navigation/OrgSwitcher';

export default function MobileNav() {
    const location = useLocation();
    
    const [showOrgSwitcher, setShowOrgSwitcher] = React.useState(false);

    const navItems = [
        { name: 'Home', icon: Home, path: 'Home' },
        { name: 'Forms', icon: ClipboardList, path: 'Submissions' },
        { name: 'Site', icon: Building2, special: 'org-switcher' },
        { name: 'Docs', icon: FolderOpen, path: 'Documents' }
    ];

    const isActive = (path) => {
        const currentPage = location.pathname.split('/').pop() || 'Home';
        return currentPage === path;
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#0a0e17] border-t border-slate-200 dark:border-blue-900/20 z-50 pb-safe">
            <div className="flex items-center justify-around h-16">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    
                    if (item.special === 'org-switcher') {
                        return (
                            <div key={item.name} className="flex-1 flex flex-col items-center justify-center">
                                <OrgSwitcher />
                            </div>
                        );
                    }
                    
                    const active = isActive(item.path);
                    
                    return (
                        <Link
                            key={item.name}
                            to={createPageUrl(item.path)}
                            className="flex-1 flex flex-col items-center justify-center relative"
                        >
                            <div className={`flex flex-col items-center transition-all ${
                                active ? 'text-[#FF8C00]' : 'text-slate-400 dark:text-slate-500'
                            }`}>
                                <Icon className="w-6 h-6 mb-1" />
                                <span className="text-xs font-medium">{item.name}</span>
                            </div>
                            {active && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#FF8C00] rounded-full"
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}