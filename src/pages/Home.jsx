import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
    FileText, CheckSquare, ClipboardList, Plus, Settings, BarChart3,
    ListTodo, FolderOpen, Scan, MoreVertical, Search, ChevronDown,
    Zap, Bell, Users, Calendar, LayoutDashboard, MessageSquare, X
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import FormCard from '@/components/forms/FormCard';
import ChecklistCard from '@/components/forms/ChecklistCard';
import EmptyState from '@/components/common/EmptyState';
import { useUserRole } from '@/components/auth/RoleGuard';
import NotificationBell from '@/components/notifications/NotificationBell';
import OrgSwitcher from '@/components/navigation/OrgSwitcher';
import { useLanguage } from '@/components/language/LanguageContext';
import { useSimpleMode } from '@/components/tutorial/SimpleModeWrapper';
import GlobalSearch from '@/components/search/GlobalSearch';
import { offlineStorage } from '@/components/mobile/OfflineStorage';
import PullToRefresh from '@/components/mobile/PullToRefresh';
import SwipeActions from '@/components/mobile/SwipeActions';
import SmartSuggestions from '@/components/ai/SmartSuggestions';
import { useQueryClient } from '@tanstack/react-query';
import EmailVerificationBanner from '@/components/auth/EmailVerificationBanner';
import OnboardingTour from '@/components/tutorial/OnboardingTour';

export default function Home() {
    const { isAdmin, canViewAll, canCreateForms, user } = useUserRole();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { isSeniorMode, isSimpleMode } = useSimpleMode();
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [activeTab, setActiveTab] = useState('forms');
    const [showGlobalSearch, setShowGlobalSearch] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    const queryClient = useQueryClient();

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
                if (navigator.onLine) await offlineStorage.saveMany('forms', data);
                return data;
            } catch {
                if (!navigator.onLine) return (await offlineStorage.getAllData('forms')) || [];
                throw new Error('Failed to load forms');
            }
        },
        staleTime: 30000,
        enabled: !!user?.organization_id,
        retry: 3,
        retryDelay: (i) => Math.min(1000 * 2 ** i, 30000)
    });

    const { data: checklists = [], isLoading: checklistsLoading } = useQuery({
        queryKey: ['checklists'],
        queryFn: async () => {
            try {
                const data = await base44.entities.ChecklistTemplate.filter({ status: 'active' });
                if (navigator.onLine) await offlineStorage.saveMany('checklists', data);
                return data;
            } catch {
                if (!navigator.onLine) return (await offlineStorage.getAllData('checklists')) || [];
                throw new Error('Failed to load checklists');
            }
        },
        staleTime: 30000,
        enabled: !!user?.organization_id,
        retry: 3,
        retryDelay: (i) => Math.min(1000 * 2 ** i, 30000)
    });

    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: () => base44.entities.Category.list(),
        staleTime: 60000,
        retry: 3
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

    const selectedCategoryName = categories.find(c => c.id === selectedCategory)?.name || 'All Categories';

    const quickActions = [
        { label: 'Fill a Form', icon: FileText, color: 'from-orange-500 to-orange-600', action: () => setActiveTab('forms') },
        { label: 'Checklist', icon: CheckSquare, color: 'from-blue-600 to-blue-700', action: () => setActiveTab('checklists') },
        { label: 'My Tasks', icon: ListTodo, color: 'from-purple-600 to-purple-700', to: createPageUrl('MyTasks') },
        { label: 'Submissions', icon: ClipboardList, color: 'from-emerald-600 to-emerald-700', to: createPageUrl('Submissions') },
        { label: 'Documents', icon: FolderOpen, color: 'from-sky-600 to-sky-700', to: createPageUrl('Documents') },
        { label: 'Scanner', icon: Scan, color: 'from-rose-600 to-rose-700', to: createPageUrl('Scanner') },
    ];

    return (
        <div className="min-h-screen bg-[#080c14] text-white overflow-y-auto">
            <OnboardingTour />
            <EmailVerificationBanner user={user} />

            {/* ── HEADER ── */}
            <header className="bg-[#0d1120] border-b border-white/5 sticky top-0 z-30">
                <div className="max-w-2xl mx-auto px-4 py-3">
                    {/* Top row */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-blue-700 flex items-center justify-center">
                                <Zap className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-lg font-bold text-white">
                                {isSeniorMode ? 'My Forms' : 'InForm Me'}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <OrgSwitcher />
                            <NotificationBell />
                            {canCreateForms && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg h-8 px-3 gap-1.5">
                                            <Plus className="w-4 h-4" />
                                            <span className="text-sm font-semibold">Create</span>
                                            <ChevronDown className="w-3 h-3 opacity-70" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-52 bg-[#131927] border-white/10 text-white">
                                        <DropdownMenuLabel className="text-white/40 text-xs">Create New</DropdownMenuLabel>
                                        <DropdownMenuItem asChild>
                                            <Link to={createPageUrl('CreateForm')} className="flex items-center gap-2 cursor-pointer text-white hover:bg-white/5">
                                                <FileText className="w-4 h-4 text-orange-400" />
                                                New Form
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link to={createPageUrl('CreateChecklist')} className="flex items-center gap-2 cursor-pointer text-white hover:bg-white/5">
                                                <CheckSquare className="w-4 h-4 text-blue-400" />
                                                New Checklist
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link to={createPageUrl('CreateTask')} className="flex items-center gap-2 cursor-pointer text-white hover:bg-white/5">
                                                <ListTodo className="w-4 h-4 text-purple-400" />
                                                New Task
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="bg-white/10" />
                                        <DropdownMenuItem asChild>
                                            <Link to={createPageUrl('UploadDocument')} className="flex items-center gap-2 cursor-pointer text-white hover:bg-white/5">
                                                <FolderOpen className="w-4 h-4 text-sky-400" />
                                                Upload Document
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/5 h-8 w-8 rounded-lg">
                                        <MoreVertical className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-52 bg-[#131927] border-white/10 text-white">
                                    <DropdownMenuLabel className="text-white/40 text-xs">Navigate</DropdownMenuLabel>
                                    {canViewAll && (
                                        <DropdownMenuItem asChild>
                                            <Link to={createPageUrl('Reports')} className="flex items-center gap-2 cursor-pointer text-white hover:bg-white/5">
                                                <BarChart3 className="w-4 h-4 text-emerald-400" />
                                                Reports
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    {isAdmin && (
                                        <DropdownMenuItem asChild>
                                            <Link to={createPageUrl('AdminDashboard')} className="flex items-center gap-2 cursor-pointer text-white hover:bg-white/5">
                                                <LayoutDashboard className="w-4 h-4 text-yellow-400" />
                                                Admin Dashboard
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem asChild>
                                        <Link to={createPageUrl('Calendar')} className="flex items-center gap-2 cursor-pointer text-white hover:bg-white/5">
                                            <Calendar className="w-4 h-4 text-sky-400" />
                                            Calendar
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to={createPageUrl('Messages')} className="flex items-center gap-2 cursor-pointer text-white hover:bg-white/5">
                                            <MessageSquare className="w-4 h-4 text-purple-400" />
                                            Messages
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-white/10" />
                                    {isAdmin && (
                                        <DropdownMenuItem asChild>
                                            <Link to={createPageUrl('UserManagement')} className="flex items-center gap-2 cursor-pointer text-white hover:bg-white/5">
                                                <Users className="w-4 h-4 text-pink-400" />
                                                User Management
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem asChild>
                                        <Link to={createPageUrl('Settings')} className="flex items-center gap-2 cursor-pointer text-white hover:bg-white/5">
                                            <Settings className="w-4 h-4 text-white/60" />
                                            Settings
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Search bar */}
                    <div className={`relative flex items-center bg-[#1a2236] rounded-xl border transition-all ${searchFocused ? 'border-orange-500/50 shadow-[0_0_0_3px_rgba(249,115,22,0.1)]' : 'border-white/8'}`}>
                        <Search className="absolute left-3 w-4 h-4 text-white/30" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => setSearchFocused(false)}
                            placeholder="Search forms & checklists..."
                            className="w-full bg-transparent text-white placeholder-white/25 pl-10 pr-20 py-2.5 text-sm focus:outline-none"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-16 text-white/30 hover:text-white/60">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                        <button
                            onClick={() => setShowGlobalSearch(true)}
                            className="absolute right-2 text-xs text-orange-400 hover:text-orange-300 font-semibold bg-orange-500/10 hover:bg-orange-500/20 px-2 py-1 rounded-lg transition-colors"
                        >
                            Advanced
                        </button>
                    </div>
                </div>
            </header>

            <PullToRefresh onRefresh={handleRefresh}>
                <div className="max-w-2xl mx-auto px-4 pt-4 pb-24">

                    {/* ── QUICK ACTION SHORTCUTS ── */}
                    <div className="mb-5">
                        <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-2.5">Quick Actions</p>
                        <div className="grid grid-cols-3 gap-2">
                            {quickActions.map((item, i) => {
                                const Icon = item.icon;
                                const inner = (
                                    <div
                                        onClick={item.action}
                                        className="bg-[#111827] border border-white/5 rounded-xl p-3 flex flex-col items-center gap-2 cursor-pointer hover:border-white/15 hover:bg-[#151e2e] active:scale-95 transition-all select-none"
                                    >
                                        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
                                            <Icon className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="text-[11px] font-medium text-white/70 text-center leading-tight">{item.label}</span>
                                    </div>
                                );
                                return item.to ? (
                                    <Link key={i} to={item.to}>{inner}</Link>
                                ) : (
                                    <div key={i}>{inner}</div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── AI SUGGESTIONS ── */}
                    {!isSimpleMode && user && (
                        <div className="mb-5">
                            <SmartSuggestions
                                forms={forms}
                                checklists={checklists}
                                userEmail={user.email}
                            />
                        </div>
                    )}

                    {/* ── FILTER ROW ── */}
                    <div className="flex items-center gap-2 mb-4">
                        {/* Tab switcher */}
                        <div className="flex bg-[#111827] border border-white/5 rounded-xl p-1 flex-1">
                            <button
                                onClick={() => setActiveTab('forms')}
                                className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                                    activeTab === 'forms'
                                        ? 'bg-orange-500 text-white shadow'
                                        : 'text-white/40 hover:text-white/70'
                                }`}
                            >
                                Forms <span className="opacity-60 font-normal">({forms.length})</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('checklists')}
                                className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                                    activeTab === 'checklists'
                                        ? 'bg-blue-600 text-white shadow'
                                        : 'text-white/40 hover:text-white/70'
                                }`}
                            >
                                Checklists <span className="opacity-60 font-normal">({checklists.length})</span>
                            </button>
                        </div>

                        {/* Category dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className={`flex items-center gap-1.5 bg-[#111827] border rounded-xl px-3 py-2.5 text-sm font-medium transition-all hover:border-white/20 ${selectedCategory ? 'border-orange-500/50 text-orange-400' : 'border-white/5 text-white/50'}`}>
                                    <span className="max-w-[90px] truncate">{selectedCategoryName}</span>
                                    <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52 bg-[#131927] border-white/10 text-white max-h-64 overflow-y-auto">
                                <DropdownMenuLabel className="text-white/40 text-xs">Filter by Category</DropdownMenuLabel>
                                <DropdownMenuItem
                                    onClick={() => setSelectedCategory(null)}
                                    className={`cursor-pointer hover:bg-white/5 ${!selectedCategory ? 'text-orange-400' : 'text-white'}`}
                                >
                                    All Categories
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-white/10" />
                                {categories.map(cat => (
                                    <DropdownMenuItem
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`cursor-pointer hover:bg-white/5 flex items-center gap-2 ${selectedCategory === cat.id ? 'text-orange-400' : 'text-white'}`}
                                    >
                                        {cat.color && (
                                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                                        )}
                                        {cat.name}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* ── CONTENT LIST ── */}
                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-[#111827] border border-white/5 rounded-xl p-4 animate-pulse">
                                    <div className="h-5 bg-white/5 rounded-lg w-2/3 mb-2" />
                                    <div className="h-3 bg-white/5 rounded w-1/2" />
                                </div>
                            ))}
                        </div>
                    ) : activeTab === 'forms' ? (
                        filteredForms.length > 0 ? (
                            <div className="space-y-3">
                                {filteredForms.map((form) => (
                                    <SwipeActions key={form.id}>
                                        <FormCard
                                            form={form}
                                            category={getCategoryById(form.category_id)}
                                            viewMode="list"
                                        />
                                    </SwipeActions>
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                icon={FileText}
                                title="No forms found"
                                description={search ? "Try adjusting your search or filters" : "Forms will appear here once created"}
                            />
                        )
                    ) : (
                        filteredChecklists.length > 0 ? (
                            <div className="space-y-3">
                                {filteredChecklists.map((checklist) => (
                                    <SwipeActions key={checklist.id}>
                                        <ChecklistCard
                                            checklist={checklist}
                                            category={getCategoryById(checklist.category_id)}
                                            viewMode="list"
                                        />
                                    </SwipeActions>
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                icon={CheckSquare}
                                title="No checklists found"
                                description={search ? "Try adjusting your search or filters" : "Checklists will appear here once created"}
                            />
                        )
                    )}
                </div>
            </PullToRefresh>

            <GlobalSearch open={showGlobalSearch} onOpenChange={setShowGlobalSearch} />
        </div>
    );
}