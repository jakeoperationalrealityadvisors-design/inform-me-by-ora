import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { httpClient } from '@/api/httpClient';
import { Folder, FileText, CheckSquare, Truck, ClipboardList, Building, Users, PackageCheck, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '@/components/language/LanguageContext';

const iconMap = {
    Folder,
    FileText,
    CheckSquare,
    Truck,
    ClipboardList,
    Building,
    Users,
    PackageCheck,
    ShieldCheck
};

export default function CategorySidebar({ selectedCategory, onSelectCategory, showAllOption = true }) {
    const { t } = useLanguage();
    
    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: () => httpClient.entities.Category.list(),
        staleTime: 60000
    });
    
    return (
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-3 text-sm uppercase tracking-wide">
                Categories
            </h3>
            <div className="space-y-1">
                {showAllOption && (
                    <button
                        onClick={() => onSelectCategory(null)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center gap-2 ${
                            selectedCategory === null
                                ? 'bg-gradient-to-r from-[#1e90ff] to-[#0066cc] text-white font-medium shadow-md'
                                : 'text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        <Folder className="w-4 h-4" />
                        All Categories
                    </button>
                )}
                {categories.map(category => {
                    const IconComponent = iconMap[category.icon] || Folder;
                    return (
                        <button
                            key={category.id}
                            onClick={() => onSelectCategory(category.id)}
                            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center gap-2 ${
                                selectedCategory === category.id
                                    ? 'bg-gradient-to-r from-[#1e90ff] to-[#0066cc] text-white font-medium shadow-md'
                                    : 'text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            <IconComponent 
                                className="w-4 h-4" 
                                style={{ color: selectedCategory === category.id ? 'white' : category.color }} 
                            />
                            {category.name}
                        </button>
                    );
                })}
            </div>
            
            {/* Quick Links */}
            <div className="mt-6 pt-6 border-t border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-3 text-xs uppercase tracking-wide">
                    Quick Links
                </h3>
                <div className="space-y-1">
                    <Link to={createPageUrl('Dashboard')}>
                        <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                            📊 Dashboard
                        </button>
                    </Link>
                    <Link to={createPageUrl('Home')}>
                        <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                            🏠 Home
                        </button>
                    </Link>
                    <Link to={createPageUrl('Documents')}>
                        <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                            📁 {t('common.documents')}
                        </button>
                    </Link>
                    <Link to={createPageUrl('MyTasks')}>
                        <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                            ✓ {t('common.tasks')}
                        </button>
                    </Link>
                    <Link to={createPageUrl('Calendar')}>
                        <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                            📅 {t('common.calendar')}
                        </button>
                    </Link>
                    <Link to={createPageUrl('Submissions')}>
                        <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                            📋 {t('common.submissions')}
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}