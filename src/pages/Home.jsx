import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { FileText, CheckSquare, ClipboardList, History, Plus, Settings, BarChart3, ListTodo, Shield, Users, Calendar, FolderOpen, LayoutGrid, LayoutList, Scan } from 'lucide-react';
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
import TooltipHelper from '@/components/tutorial/TooltipHelper';
import { useSimpleMode } from '@/components/tutorial/SimpleModeWrapper';
import GlobalSearch from '@/components/search/GlobalSearch';
import CategorySidebar from '@/components/navigation/CategorySidebar';
import ThemeToggle from '@/components/theme/ThemeToggle';
import { offlineStorage } from '@/components/mobile/OfflineStorage';
import PullToRefresh from '@/components/mobile/PullToRefresh';
import PushNotificationToggle from '@/components/mobile/PushNotifications';
import SwipeActions from '@/components/mobile/SwipeActions';
import { useNavigate } from 'react-router-dom';

export default function Home() {
    const { isAdmin, canViewAll, canCreateForms, user } = useUserRole();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { isSeniorMode, isSimpleMode, isExpertMode, technicalLevel } = useSimpleMode();
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [activeTab, setActiveTab] = useState('forms');
    const [showGlobalSearch, setShowGlobalSearch] = useState(false);
    const [viewMode, setViewMode] = useState(isSimpleMode ? 'grid' : 'list');
    
    // Redirect to onboarding if no organization
    React.useEffect(() => {
        if (user && !user.organization_id) {
            navigate(createPageUrl('NetworkOnboarding'));
        }
    }, [user, navigate]);
    
    const { data: forms = [], isLoading: formsLoading } = useQuery({
        queryKey: ['forms'],
        queryFn: async () => {
            try {
                const data = await base44.entities.FormTemplate.filter({ status: 'active' });
                // Cache for offline
                if (navigator.onLine) {
                    await offlineStorage.saveMany('forms', data);
                }
                return data;
            } catch (error) {
                // Load from offline cache if online request fails
                if (!navigator.onLine) {
                    const cached = await offlineStorage.getAllData('forms');
                    return cached || [];
                }
                throw error;
            }
        },
        staleTime: 30000,
        enabled: !!user?.organization_id
    });
    
    const { data: checklists = [], isLoading: checklistsLoading } = useQuery({
        queryKey: ['checklists'],
        queryFn: async () => {
            try {
                const data = await base44.entities.ChecklistTemplate.filter({ status: 'active' });
                // Cache for offline
                if (navigator.onLine) {
                    await offlineStorage.saveMany('checklists', data);
                }
                return data;
            } catch (error) {
                // Load from offline cache if online request fails
                if (!navigator.onLine) {
                    const cached = await offlineStorage.getAllData('checklists');
                    return cached || [];
                }
                throw error;
            }
        },
        staleTime: 30000,
        enabled: !!user?.organization_id
    });
    
    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: () => base44.entities.Category.list(),
        staleTime: 60000
    });
    
    const handleRefresh = async () => {
        await Promise.all([
            queryClient.invalidateQueries(['forms']),
            queryClient.invalidateQueries(['checklists']),
            queryClient.invalidateQueries(['categories'])
        ]);
    };
    
    const filteredForms = React.useMemo(() => {
        if (!forms) return [];
        return forms.filter(form => {
            const matchesSearch = !search || form.title.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = !selectedCategory || form.category_id === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [forms, search, selectedCategory]);
    
    const filteredChecklists = React.useMemo(() => {
        if (!checklists) return [];
        return checklists.filter(cl => {
            const matchesSearch = !search || cl.title.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = !selectedCategory || cl.category_id === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [checklists, search, selectedCategory]);
    
    const getCategoryById = React.useCallback((id) => categories.find(c => c.id === id), [categories]);
    
    const isLoading = formsLoading || checklistsLoading;
    
    return (
        <div className="min-h-screen bg-[#0a0e17] transition-colors overflow-y-auto">
            {/* Header */}
            <div className="bg-[#0a0e17] border-b border-blue-900/30 sticky top-0 z-20 shadow-sm transition-colors">
                <div className="max-w-2xl mx-auto px-3 sm:px-4 py-3">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-bold text-[#FF8C00]">
                            {isSeniorMode ? 'My Forms' : 'InForm Me'}
                        </h1>
                        <div className="flex gap-2">
                            <NotificationBell />
                            <Link to={createPageUrl('Scanner')}>
                                <Button variant="ghost" size="icon" className="rounded-full text-[#FF8C00]">
                                    <Scan className="w-5 h-5" />
                                </Button>
                            </Link>
                            {canCreateForms && (
                                <Link to={createPageUrl('CreateForm')}>
                                    <Button size="icon" className="rounded-full bg-gradient-to-r from-[#FF8C00] to-[#1E40AF]">
                                        <Plus className="w-5 h-5" />
                                    </Button>
                                </Link>
                            )}
                            <Link to={createPageUrl('Settings')}>
                                <Button variant="ghost" size="icon" className="rounded-full text-[#FF8C00]">
                                    <Settings className="w-5 h-5" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                    
                    <div className="relative">
                        <SearchBar
                            value={search}
                            onChange={setSearch}
                            placeholder={t('home.searchPlaceholder')}
                        />
                        <button
                            onClick={() => setShowGlobalSearch(true)}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 rounded hover:bg-blue-50"
                        >
                            Advanced
                        </button>
                    </div>
                </div>
                </div>

                <PullToRefresh onRefresh={handleRefresh}>
                <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-20 sm:pb-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar - Desktop Only */}
                    <div className="hidden lg:block lg:col-span-1">
                        <CategorySidebar 
                            selectedCategory={selectedCategory}
                            onSelectCategory={setSelectedCategory}
                        />
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                {/* Tab Switcher */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('forms')}
                        className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                            activeTab === 'forms' 
                                ? 'bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] text-white' 
                                : 'bg-[#0f1419] text-[#FF8C00]/70 border border-blue-900/30'
                        }`}
                    >
                        Forms ({forms.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('checklists')}
                        className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                            activeTab === 'checklists' 
                                ? 'bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] text-white' 
                                : 'bg-[#0f1419] text-[#FF8C00]/70 border border-blue-900/30'
                        }`}
                    >
                        Checklists ({checklists.length})
                    </button>
                </div>
                

                
                {/* Content */}
                {isLoading ? (
                    <div className="grid gap-3 sm:gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-[#0a0e17] rounded-lg border border-blue-900/30 p-4 sm:p-5 animate-pulse shadow-lg transition-colors">
                                <div className="h-8 sm:h-10 bg-blue-900/30 rounded mb-3 sm:mb-4" />
                                <div className="h-4 sm:h-5 w-3/4 bg-blue-900/20 rounded mb-2" />
                                <div className="h-3 sm:h-4 w-1/2 bg-blue-900/10 rounded" />
                            </div>
                        ))}
                    </div>
                ) : activeTab === 'forms' ? (
                    filteredForms.length > 0 ? (
                        <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4" : "grid gap-3 sm:gap-4"}>
                            {filteredForms.map((form) => (
                                <SwipeActions key={form.id}>
                                    <FormCard 
                                        form={form} 
                                        category={getCategoryById(form.category_id)}
                                        viewMode={viewMode}
                                    />
                                </SwipeActions>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon={FileText}
                            title={t('home.noFormsFound')}
                            description={search ? t('home.tryAdjusting') : "Forms will appear here once created"}
                        />
                    )
                ) : (
                    filteredChecklists.length > 0 ? (
                        <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4" : "grid gap-3 sm:gap-4"}>
                            {filteredChecklists.map((checklist) => (
                                <SwipeActions key={checklist.id}>
                                    <ChecklistCard 
                                        checklist={checklist}
                                        category={getCategoryById(checklist.category_id)}
                                        viewMode={viewMode}
                                    />
                                </SwipeActions>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon={CheckSquare}
                            title={t('home.noChecklistsFound')}
                            description={search ? t('home.tryAdjusting') : "Checklists will appear here once created"}
                        />
                    )
                    )}
                    </div>
                    </div>
                    </div>
                    </PullToRefresh>
                    <GlobalSearch open={showGlobalSearch} onOpenChange={setShowGlobalSearch} />
                    <BottomNav />
                    </div>
                    );
                    }