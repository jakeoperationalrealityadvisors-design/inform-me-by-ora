import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { FileText, CheckSquare, ClipboardList, History, Plus, Settings, BarChart3, ListTodo, Shield, Users, Calendar, FolderOpen, LayoutGrid, LayoutList } from 'lucide-react';
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
        <div className="min-h-screen bg-[#0a0e17] transition-colors">
            {/* Header */}
            <div className="bg-[#0a0e17] border-b border-blue-900/30 sticky top-0 z-10 shadow-sm transition-colors">
                <div className="max-w-2xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <img 
                                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6954526c42ec916a050b905d/d38d72306_file_00000000ab1471f5a410df212e51129f1.png" 
                                alt="InForm Me - Operational Reality Advisors"
                                className={isSeniorMode ? "h-16 flex-shrink-0 rounded-lg" : isSimpleMode ? "h-12 flex-shrink-0 rounded-lg" : "h-8 sm:h-12 flex-shrink-0 rounded-lg"}
                            />
                            <div className="min-w-0">
                                <h1 className={`font-bold text-[#FF8C00] truncate ${isSeniorMode ? 'text-2xl' : isSimpleMode ? 'text-xl' : 'text-sm sm:text-xl'}`}>
                                    {isSeniorMode ? 'My Forms' : t('home.title')}
                                </h1>
                                {!isSimpleMode && !isSeniorMode && <p className="text-xs text-[#FF8C00]/70 hidden sm:block">{t('home.subtitle')}</p>}
                            </div>
                        </div>
                        <div className="flex gap-1 sm:gap-2 flex-shrink-0 items-center">
                            {!isExpertMode && (
                                <TooltipHelper
                                    id="home-notifications"
                                    title="Notifications"
                                    description="Stay updated with task assignments, form submissions, and important updates in real-time."
                                />
                            )}
                            {!isSeniorMode && <NotificationBell />}
                            {!isSimpleMode && !isSeniorMode && <PushNotificationToggle />}
                            {!isSimpleMode && !isSeniorMode && <ThemeToggle />}
                            {!isSimpleMode && !isSeniorMode && <LanguageSwitcher />}
                            {canCreateForms && (
                                <>
                                    {!isExpertMode && (
                                        <TooltipHelper
                                            id="home-create"
                                            title="Create Forms"
                                            description="Build custom forms and checklists for your team. Use templates or start from scratch with our AI-powered builder."
                                        />
                                    )}
                                    <Link to={createPageUrl('CreateForm')}>
                                        <Button variant="ghost" size="icon" className={`rounded-full hover:bg-blue-900/30 text-[#FF8C00] ${isSeniorMode ? 'h-16 w-16' : isSimpleMode ? 'h-12 w-12' : 'h-9 w-9 sm:h-10 sm:w-10'}`}>
                                            <Plus className={isSeniorMode ? 'w-8 h-8' : isSimpleMode ? 'w-6 h-6' : 'w-4 h-4 sm:w-5 sm:h-5'} />
                                        </Button>
                                    </Link>
                                    </>
                                    )}
                                    {!isSeniorMode && !isExpertMode && (
                                    <TooltipHelper
                                    id="home-tasks"
                                    title="My Tasks"
                                    description="View all tasks assigned to you, track deadlines, and manage your workload efficiently."
                                    />
                                    )}
                                    {!isSeniorMode && (
                                    <Link to={createPageUrl('MyTasks')}>
                                    <Button variant="ghost" size="icon" className={`rounded-full hover:bg-blue-900/30 text-[#FF8C00] ${isSimpleMode ? 'h-12 w-12' : 'h-9 w-9 sm:h-10 sm:w-10'}`}>
                                        <ListTodo className={isSimpleMode ? 'w-6 h-6' : 'w-4 h-4 sm:w-5 sm:h-5'} />
                                    </Button>
                                    </Link>
                                    )}
                                    <Link to={createPageUrl('Settings')}>
                                    <Button variant="ghost" size="icon" className={`rounded-full hover:bg-blue-900/30 text-[#FF8C00] ${isSeniorMode ? 'h-16 w-16' : isSimpleMode ? 'h-12 w-12' : 'h-9 w-9 sm:h-10 sm:w-10'}`}>
                                    <Settings className={isSeniorMode ? 'w-8 h-8' : isSimpleMode ? 'w-6 h-6' : 'w-4 h-4 sm:w-5 sm:h-5'} />
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
                <div className="flex gap-2 p-1 bg-[#0a0e17] rounded-xl mb-4 sm:mb-6 border border-blue-900/30 shadow-sm transition-colors">
                    <button
                        onClick={() => setActiveTab('forms')}
                        className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 rounded-lg font-medium transition-all ${
                            isSeniorMode ? 'py-6 text-2xl' : isSimpleMode ? 'py-4 text-base' : 'py-2.5 sm:py-3 text-xs sm:text-sm'
                        } ${
                            activeTab === 'forms' 
                                ? 'bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] text-black shadow-md shadow-orange-500/20' 
                                : 'text-[#FF8C00]/70 hover:bg-blue-900/20'
                        }`}
                    >
                        <FileText className={isSeniorMode ? 'w-10 h-10' : isSimpleMode ? 'w-6 h-6' : 'w-4 h-4'} />
                        <span>{isSeniorMode ? 'Forms' : t('common.forms')}</span>
                        {isSeniorMode && <span className="text-lg opacity-80">({forms.length})</span>}
                        {isSimpleMode && !isSeniorMode && <span className="text-xs opacity-80">({forms.length} available)</span>}
                        {!isSimpleMode && !isSeniorMode && <span className="hidden xs:inline">({forms.length})</span>}
                    </button>
                    <button
                        onClick={() => setActiveTab('checklists')}
                        className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 rounded-lg font-medium transition-all ${
                            isSeniorMode ? 'py-6 text-2xl' : isSimpleMode ? 'py-4 text-base' : 'py-2.5 sm:py-3 text-xs sm:text-sm'
                        } ${
                            activeTab === 'checklists' 
                                ? 'bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] text-black shadow-md shadow-orange-500/20' 
                                : 'text-[#FF8C00]/70 hover:bg-blue-900/20'
                        }`}
                    >
                        <CheckSquare className={isSeniorMode ? 'w-10 h-10' : isSimpleMode ? 'w-6 h-6' : 'w-4 h-4'} />
                        <span>{isSeniorMode ? 'Checklists' : t('common.checklists')}</span>
                        {isSeniorMode && <span className="text-lg opacity-80">({checklists.length})</span>}
                        {isSimpleMode && !isSeniorMode && <span className="text-xs opacity-80">({checklists.length} available)</span>}
                        {!isSimpleMode && !isSeniorMode && <span className="hidden xs:inline">({checklists.length})</span>}
                    </button>
                </div>
                
                {/* View Mode Toggle & Category Filter */}
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    {categories.length > 0 && !isSimpleMode && !isSeniorMode && (
                        <div className="flex-1">
                            <CategoryFilter
                                categories={categories}
                                selected={selectedCategory}
                                onSelect={setSelectedCategory}
                            />
                        </div>
                    )}
                    {!isSimpleMode && !isSeniorMode && (
                        <div className="flex items-center gap-2">
                            {!isExpertMode && (
                                <TooltipHelper
                                    id="home-view-toggle"
                                    title="View Options"
                                    description="Switch between list view for details or grid view for a visual overview of your forms and checklists."
                                />
                            )}
                            <div className="flex gap-1 bg-[#0a0e17] rounded-lg border border-blue-900/30 p-1">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded transition-colors ${
                                        viewMode === 'list' 
                                            ? 'bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] text-black' 
                                            : 'text-[#FF8C00]/70 hover:bg-blue-900/20'
                                    }`}
                                >
                                    <LayoutList className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded transition-colors ${
                                        viewMode === 'grid' 
                                            ? 'bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] text-black' 
                                            : 'text-[#FF8C00]/70 hover:bg-blue-900/20'
                                    }`}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
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