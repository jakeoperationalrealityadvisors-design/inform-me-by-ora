import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { FileText, CheckSquare, ClipboardList, History, Plus, Settings, BarChart3, ListTodo, Shield, Users, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import SearchBar from '@/components/common/SearchBar';
import FormCard from '@/components/forms/FormCard';
import ChecklistCard from '@/components/forms/ChecklistCard';
import CategoryFilter from '@/components/forms/CategoryFilter';
import EmptyState from '@/components/common/EmptyState';
import { useUserRole } from '@/components/auth/RoleGuard';

export default function Home() {
    const { isAdmin, canViewAll } = useUserRole();
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [activeTab, setActiveTab] = useState('forms');
    
    const { data: forms = [], isLoading: formsLoading } = useQuery({
        queryKey: ['forms'],
        queryFn: () => base44.entities.FormTemplate.filter({ status: 'active' })
    });
    
    const { data: checklists = [], isLoading: checklistsLoading } = useQuery({
        queryKey: ['checklists'],
        queryFn: () => base44.entities.ChecklistTemplate.filter({ status: 'active' })
    });
    
    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: () => base44.entities.Category.list()
    });
    
    const getCategoryById = (id) => categories.find(c => c.id === id);
    
    const filteredForms = forms.filter(form => {
        const matchesSearch = !search || form.title.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = !selectedCategory || form.category_id === selectedCategory;
        return matchesSearch && matchesCategory;
    });
    
    const filteredChecklists = checklists.filter(cl => {
        const matchesSearch = !search || cl.title.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = !selectedCategory || cl.category_id === selectedCategory;
        return matchesSearch && matchesCategory;
    });
    
    const isLoading = formsLoading || checklistsLoading;
    
    return (
        <div className="min-h-screen bg-slate-100">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <img 
                                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6954526c42ec916a050b905d/a3d021289_file_000000005d3071f5ac3dbefae9155a78.png" 
                                alt="Operational Reality Advisors"
                                className="h-12"
                            />
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">
                                    Operational<span className="text-[#1e90ff]">Reality</span>
                                </h1>
                                <p className="text-xs text-slate-600">Forms & Checklists</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Link to={createPageUrl('DailyTasks')}>
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 text-slate-600">
                                    <Calendar className="w-5 h-5" />
                                </Button>
                            </Link>
                            <Link to={createPageUrl('MyTasks')}>
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 text-slate-600">
                                    <ListTodo className="w-5 h-5" />
                                </Button>
                            </Link>
                            {canViewAll && (
                                <Link to={createPageUrl('Reports')}>
                                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 text-slate-600">
                                        <BarChart3 className="w-5 h-5" />
                                    </Button>
                                </Link>
                            )}
                            <Link to={createPageUrl('Submissions')}>
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 text-slate-600">
                                    <History className="w-5 h-5" />
                                </Button>
                            </Link>
                            {isAdmin && (
                                <>
                                    <Link to={createPageUrl('Admin')}>
                                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 text-slate-600">
                                            <Shield className="w-5 h-5" />
                                        </Button>
                                    </Link>
                                    <Link to={createPageUrl('UserManagement')}>
                                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 text-slate-600">
                                            <Users className="w-5 h-5" />
                                        </Button>
                                    </Link>
                                </>
                            )}
                            <Link to={createPageUrl('Settings')}>
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 text-slate-600">
                                    <Settings className="w-5 h-5" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                    
                    <SearchBar
                        value={search}
                        onChange={setSearch}
                        placeholder="Search forms and checklists..."
                    />
                </div>
            </div>
            
            <div className="max-w-2xl mx-auto px-4 py-6">
                {/* Tab Switcher */}
                <div className="flex gap-2 p-1 bg-white rounded-xl mb-6 border border-slate-200 shadow-sm">
                    <button
                        onClick={() => setActiveTab('forms')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm transition-all ${
                            activeTab === 'forms' 
                                ? 'bg-gradient-to-r from-[#1e90ff] to-[#0066cc] text-white shadow-md' 
                                : 'text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        <FileText className="w-4 h-4" />
                        Forms ({forms.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('checklists')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm transition-all ${
                            activeTab === 'checklists' 
                                ? 'bg-gradient-to-r from-[#1e90ff] to-[#0066cc] text-white shadow-md' 
                                : 'text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        <CheckSquare className="w-4 h-4" />
                        Checklists ({checklists.length})
                    </button>
                </div>
                
                {/* Category Filter */}
                {categories.length > 0 && (
                    <div className="mb-6">
                        <CategoryFilter
                            categories={categories}
                            selected={selectedCategory}
                            onSelect={setSelectedCategory}
                        />
                    </div>
                )}
                
                {/* Content */}
                {isLoading ? (
                    <div className="grid gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-lg border border-slate-200 p-5 animate-pulse shadow-lg">
                                <div className="h-10 bg-slate-200 rounded mb-4" />
                                <div className="h-5 w-3/4 bg-slate-200 rounded mb-2" />
                                <div className="h-4 w-1/2 bg-slate-100 rounded" />
                            </div>
                        ))}
                    </div>
                ) : activeTab === 'forms' ? (
                    filteredForms.length > 0 ? (
                        <motion.div 
                            className="grid gap-4"
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
                            title="No forms found"
                            description={search ? "Try adjusting your search" : "Forms will appear here once created"}
                        />
                    )
                ) : (
                    filteredChecklists.length > 0 ? (
                        <motion.div 
                            className="grid gap-4"
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
                            title="No checklists found"
                            description={search ? "Try adjusting your search" : "Checklists will appear here once created"}
                        />
                    )
                )}
            </div>
        </div>
    );
}