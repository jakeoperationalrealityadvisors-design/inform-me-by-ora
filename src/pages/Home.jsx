import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { FileText, CheckSquare, ClipboardList, History, Plus, Settings, BarChart3, ListTodo, Shield, Users, Calendar, FolderOpen } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import SearchBar from '@/components/common/SearchBar';
import FormCard from '@/components/forms/FormCard';
import ChecklistCard from '@/components/forms/ChecklistCard';
import CategoryFilter from '@/components/forms/CategoryFilter';
import EmptyState from '@/components/common/EmptyState';
import { useUserRole } from '@/components/auth/RoleGuard';
import NotificationBell from '@/components/notifications/NotificationBell';
import BottomNav from '@/components/navigation/BottomNav';
import { useLanguage } from '@/components/language/LanguageContext';
import LanguageSwitcher from '@/components/language/LanguageSwitcher';

export default function Home() {
    const { isAdmin, canViewAll } = useUserRole();
    const { t } = useLanguage();
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [activeTab, setActiveTab] = useState('forms');
    
    const { data: forms = [], isLoading: formsLoading } = useQuery({
        queryKey: ['forms'],
        queryFn: () => base44.entities.FormTemplate.filter({ status: 'active' }),
        staleTime: 30000
    });
    
    const { data: checklists = [], isLoading: checklistsLoading } = useQuery({
        queryKey: ['checklists'],
        queryFn: () => base44.entities.ChecklistTemplate.filter({ status: 'active' }),
        staleTime: 30000
    });
    
    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: () => base44.entities.Category.list(),
        staleTime: 60000
    });
    
    const getCategoryById = (id) => categories.find(c => c.id === id);
    
    const filteredForms = React.useMemo(() => forms.filter(form => {
        const matchesSearch = !search || form.title.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = !selectedCategory || form.category_id === selectedCategory;
        return matchesSearch && matchesCategory;
    }), [forms, search, selectedCategory]);
    
    const filteredChecklists = React.useMemo(() => checklists.filter(cl => {
        const matchesSearch = !search || cl.title.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = !selectedCategory || cl.category_id === selectedCategory;
        return matchesSearch && matchesCategory;
    }), [checklists, search, selectedCategory]);
    
    const isLoading = formsLoading || checklistsLoading;
    
    return (
        <div className="min-h-screen bg-slate-100">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-2xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <img 
                                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6954526c42ec916a050b905d/a3d021289_file_000000005d3071f5ac3dbefae9155a78.png" 
                                alt="Operational Reality Advisors"
                                className="h-8 sm:h-12 flex-shrink-0"
                            />
                            <div className="min-w-0">
                                <h1 className="text-sm sm:text-xl font-bold text-slate-900 truncate">
                                    {t('home.title')}
                                </h1>
                                <p className="text-xs text-slate-600 hidden sm:block">{t('home.subtitle')}</p>
                            </div>
                        </div>
                        <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                            <NotificationBell />
                            <LanguageSwitcher />
                            <Link to={createPageUrl('MyTasks')}>
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 text-slate-600 h-9 w-9 sm:h-10 sm:w-10">
                                    <ListTodo className="w-4 h-4 sm:w-5 sm:h-5" />
                                </Button>
                            </Link>
                            <Link to={createPageUrl('Settings')}>
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 text-slate-600 h-9 w-9 sm:h-10 sm:w-10">
                                    <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                    
                    <SearchBar
                        value={search}
                        onChange={setSearch}
                        placeholder={t('home.searchPlaceholder')}
                    />
                </div>
            </div>
            
            <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-20 sm:pb-6">
                {/* Tab Switcher */}
                <div className="flex gap-2 p-1 bg-white rounded-xl mb-4 sm:mb-6 border border-slate-200 shadow-sm">
                    <button
                        onClick={() => setActiveTab('forms')}
                        className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 rounded-lg font-medium text-xs sm:text-sm transition-all ${
                            activeTab === 'forms' 
                                ? 'bg-gradient-to-r from-[#1e90ff] to-[#0066cc] text-white shadow-md' 
                                : 'text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        <FileText className="w-4 h-4" />
                        <span className="hidden xs:inline">{t('common.forms')}</span> ({forms.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('checklists')}
                        className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 rounded-lg font-medium text-xs sm:text-sm transition-all ${
                            activeTab === 'checklists' 
                                ? 'bg-gradient-to-r from-[#1e90ff] to-[#0066cc] text-white shadow-md' 
                                : 'text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        <CheckSquare className="w-4 h-4" />
                        <span className="hidden xs:inline">{t('common.checklists')}</span> ({checklists.length})
                    </button>
                </div>
                
                {/* Category Filter */}
                {categories.length > 0 && (
                    <div className="mb-4 sm:mb-6">
                        <CategoryFilter
                            categories={categories}
                            selected={selectedCategory}
                            onSelect={setSelectedCategory}
                        />
                    </div>
                )}
                
                {/* Content */}
                {isLoading ? (
                    <div className="grid gap-3 sm:gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 animate-pulse shadow-lg">
                                <div className="h-8 sm:h-10 bg-slate-200 rounded mb-3 sm:mb-4" />
                                <div className="h-4 sm:h-5 w-3/4 bg-slate-200 rounded mb-2" />
                                <div className="h-3 sm:h-4 w-1/2 bg-slate-100 rounded" />
                            </div>
                        ))}
                    </div>
                ) : activeTab === 'forms' ? (
                    filteredForms.length > 0 ? (
                        <motion.div 
                            className="grid gap-3 sm:gap-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {filteredForms.map((form, idx) => (
                                <motion.div
                                    key={form.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <FormCard 
                                        form={form} 
                                        category={getCategoryById(form.category_id)}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <EmptyState
                            icon={FileText}
                            title={t('home.noFormsFound')}
                            description={search ? t('home.tryAdjusting') : "Forms will appear here once created"}
                        />
                    )
                ) : (
                    filteredChecklists.length > 0 ? (
                        <motion.div 
                            className="grid gap-3 sm:gap-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {filteredChecklists.map((checklist, idx) => (
                                <motion.div
                                    key={checklist.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <ChecklistCard 
                                        checklist={checklist}
                                        category={getCategoryById(checklist.category_id)}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <EmptyState
                            icon={CheckSquare}
                            title={t('home.noChecklistsFound')}
                            description={search ? t('home.tryAdjusting') : "Checklists will appear here once created"}
                        />
                    )
                    )}
                    </div>
                    <BottomNav />
                    </div>
                    );
                    }