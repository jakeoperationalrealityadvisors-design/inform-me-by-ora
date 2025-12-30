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
        <div className="min-h-screen bg-[#0a0e17]">
            {/* Header */}
            <div className="bg-[#0f1419] border-b border-blue-900/20 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white">Forms & Checklists</h1>
                            <p className="text-sm text-blue-400">Access your documents anywhere</p>
                        </div>
                        <div className="flex gap-2">
                            <Link to={createPageUrl('DailyTasks')}>
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-950/50 text-blue-400">
                                    <Calendar className="w-5 h-5" />
                                </Button>
                            </Link>
                            <Link to={createPageUrl('MyTasks')}>
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-950/50 text-blue-400">
                                    <ListTodo className="w-5 h-5" />
                                </Button>
                            </Link>
                            {canViewAll && (
                                <Link to={createPageUrl('Reports')}>
                                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-950/50 text-blue-400">
                                        <BarChart3 className="w-5 h-5" />
                                    </Button>
                                </Link>
                            )}
                            <Link to={createPageUrl('Submissions')}>
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-950/50 text-blue-400">
                                    <History className="w-5 h-5" />
                                </Button>
                            </Link>
                            {isAdmin && (
                                <>
                                    <Link to={createPageUrl('Admin')}>
                                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-950/50 text-blue-400">
                                            <Shield className="w-5 h-5" />
                                        </Button>
                                    </Link>
                                    <Link to={createPageUrl('UserManagement')}>
                                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-950/50 text-blue-400">
                                            <Users className="w-5 h-5" />
                                        </Button>
                                    </Link>
                                </>
                            )}
                            <Link to={createPageUrl('Settings')}>
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-950/50 text-blue-400">
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
                <div className="flex gap-2 p-1 bg-[#0f1419] rounded-2xl mb-6">
                    <button
                        onClick={() => setActiveTab('forms')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all ${
                            activeTab === 'forms' 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                                : 'text-blue-300 hover:text-white'
                        }`}
                    >
                        <FileText className="w-4 h-4" />
                        Forms ({forms.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('checklists')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all ${
                            activeTab === 'checklists' 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                                : 'text-blue-300 hover:text-white'
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
                            <div key={i} className="bg-[#0f1419] rounded-2xl border border-blue-900/20 p-5 animate-pulse">
                                <div className="w-12 h-12 rounded-xl bg-blue-950 mb-4" />
                                <div className="h-5 w-3/4 bg-blue-950 rounded mb-2" />
                                <div className="h-4 w-1/2 bg-blue-950/50 rounded" />
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