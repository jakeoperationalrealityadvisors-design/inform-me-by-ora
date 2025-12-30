import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, FileText, CheckSquare, User, MapPin, Clock, ChevronRight, Eye } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import SearchBar from '@/components/common/SearchBar';
import EmptyState from '@/components/common/EmptyState';
import { useUserRole } from '@/components/auth/RoleGuard';

export default function Submissions() {
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('forms');
    const { user, canViewAll } = useUserRole();
    
    const { data: formSubmissions = [], isLoading: formsLoading } = useQuery({
        queryKey: ['form-submissions'],
        queryFn: async () => {
            const all = await base44.entities.FormSubmission.list('-created_date');
            // Team members only see their own submissions
            if (!canViewAll) {
                return all.filter(f => f.created_by === user?.email);
            }
            return all;
        }
    });
    
    const { data: checklistSubmissions = [], isLoading: checklistsLoading } = useQuery({
        queryKey: ['checklist-submissions'],
        queryFn: async () => {
            const all = await base44.entities.ChecklistSubmission.list('-created_date');
            // Team members only see their own submissions
            if (!canViewAll) {
                return all.filter(c => c.created_by === user?.email);
            }
            return all;
        }
    });
    
    const filteredForms = formSubmissions.filter(sub =>
        !search || 
        sub.form_title?.toLowerCase().includes(search.toLowerCase()) ||
        sub.submitted_by_name?.toLowerCase().includes(search.toLowerCase())
    );
    
    const filteredChecklists = checklistSubmissions.filter(sub =>
        !search || 
        sub.checklist_title?.toLowerCase().includes(search.toLowerCase()) ||
        sub.submitted_by_name?.toLowerCase().includes(search.toLowerCase())
    );
    
    const statusColors = {
        submitted: 'bg-blue-100 text-blue-700',
        reviewed: 'bg-amber-100 text-amber-700',
        approved: 'bg-emerald-100 text-emerald-700',
        rejected: 'bg-red-100 text-red-700',
        in_progress: 'bg-amber-100 text-amber-700',
        completed: 'bg-emerald-100 text-emerald-700'
    };
    
    const isLoading = formsLoading || checklistsLoading;
    
    return (
        <div className="min-h-screen bg-[#0a0e17]">
            {/* Header */}
            <div className="bg-[#0f1419] border-b border-blue-900/20 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4 mb-4">
                        <Link to={createPageUrl('Home')}>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-white">Submissions</h1>
                            <p className="text-sm text-blue-400">View all submitted forms and checklists</p>
                        </div>
                    </div>
                    
                    <SearchBar
                        value={search}
                        onChange={setSearch}
                        placeholder="Search submissions..."
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
                        Forms ({formSubmissions.length})
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
                        Checklists ({checklistSubmissions.length})
                    </button>
                </div>
                
                {/* Content */}
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-[#0f1419] rounded-2xl border border-blue-900/20 p-5 animate-pulse">
                                <div className="h-5 w-3/4 bg-blue-950 rounded mb-3" />
                                <div className="h-4 w-1/2 bg-blue-950/50 rounded" />
                            </div>
                        ))}
                    </div>
                ) : activeTab === 'forms' ? (
                    filteredForms.length > 0 ? (
                        <div className="space-y-4">
                            {filteredForms.map((sub, idx) => (
                                <motion.div
                                    key={sub.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Link to={createPageUrl(`ViewFormSubmission?id=${sub.id}`)}>
                                        <div className="bg-[#0f1419] rounded-2xl border border-blue-900/20 p-5 hover:border-blue-700/50 hover:shadow-lg hover:shadow-blue-900/20 transition-all group">
                                            <div className="flex items-start justify-between mb-3">
                                                <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                                                    {sub.form_title}
                                                </h3>
                                                <Badge className={statusColors[sub.status]}>
                                                    {sub.status}
                                                </Badge>
                                            </div>
                                            <div className="flex flex-wrap gap-4 text-sm text-blue-400/70">
                                                {sub.submitted_by_name && (
                                                    <span className="flex items-center gap-1">
                                                        <User className="w-4 h-4" />
                                                        {sub.submitted_by_name}
                                                    </span>
                                                )}
                                                {sub.location && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-4 h-4" />
                                                        {sub.location}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {format(new Date(sub.created_date), 'MMM d, h:mm a')}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon={FileText}
                            title="No form submissions"
                            description="Form submissions will appear here"
                        />
                    )
                ) : (
                    filteredChecklists.length > 0 ? (
                        <div className="space-y-4">
                            {filteredChecklists.map((sub, idx) => (
                                <motion.div
                                    key={sub.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Link to={createPageUrl(`ViewChecklistSubmission?id=${sub.id}`)}>
                                        <div className="bg-[#0f1419] rounded-2xl border border-blue-900/20 p-5 hover:border-blue-700/50 hover:shadow-lg hover:shadow-blue-900/20 transition-all group">
                                            <div className="flex items-start justify-between mb-3">
                                                <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                                                    {sub.checklist_title}
                                                </h3>
                                                <Badge className={statusColors[sub.status]}>
                                                    {sub.completion_percentage}% complete
                                                </Badge>
                                            </div>
                                            <div className="flex flex-wrap gap-4 text-sm text-blue-400/70">
                                                {sub.submitted_by_name && (
                                                    <span className="flex items-center gap-1">
                                                        <User className="w-4 h-4" />
                                                        {sub.submitted_by_name}
                                                    </span>
                                                )}
                                                {sub.location && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-4 h-4" />
                                                        {sub.location}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {format(new Date(sub.created_date), 'MMM d, h:mm a')}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon={CheckSquare}
                            title="No checklist submissions"
                            description="Checklist submissions will appear here"
                        />
                    )
                )}
            </div>
        </div>
    );
}