import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, Calendar, FolderOpen, BarChart3, Settings, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserRole } from '@/components/auth/RoleGuard';
import { useLanguage } from '@/components/language/LanguageContext';

export default function BottomNav() {
    const location = useLocation();
    const { canViewAll } = useUserRole();
    const { t } = useLanguage();
    
    const isActive = (pageName) => {
        return location.pathname.includes(pageName);
    };
    
    const navItems = [
        { name: 'Dashboard', nameKey: 'Dashboard', icon: LayoutDashboard, path: 'Dashboard' },
        { name: t('common.forms'), nameKey: 'Home', icon: Home, path: 'Home' },
        { name: t('common.calendar'), nameKey: 'Calendar', icon: Calendar, path: 'Calendar' },
        { name: t('common.documents'), nameKey: 'Documents', icon: FolderOpen, path: 'Documents' },
        { name: t('common.settings'), nameKey: 'Settings', icon: Settings, path: 'Settings' }
    ];
    
    return (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 safe-area-inset-bottom">
            <div className="flex justify-around items-center h-16 px-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                        <Link
                            key={item.path}
                            to={createPageUrl(item.path)}
                            className={cn(
                                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                                active ? "text-[#1e90ff]" : "text-slate-400"
                            )}
                        >
                            <Icon className={cn("w-5 h-5", active && "scale-110")} />
                            <span className="text-xs font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}